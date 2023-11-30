import { fromHex } from '@rigidity/bls-signatures'
import { liveQuery } from 'dexie'
import {
    makeAutoObservable,
    onBecomeObserved,
    onBecomeUnobserved,
    runInAction,
} from 'mobx'

import {
    callGetBalance,
    callGetBalanceByPuzzleHashes,
    callGetCATs,
    callGetExchangeRate,
} from '~/api/api'
import { IAsset } from '~/db'
import rootStore from '~/store'
import { IExchangeRate, IFetchData } from '~/types/api'
import { Asset } from '~/types/entities'
import { CAT } from '~/utils/CAT'
import { mojoToCat, mojoToXch } from '~/utils/CoinConverter'
import { chains } from '~/utils/constants'
import { getStorage, setStorage } from '~/utils/extension/storage'
import { Wallet } from '~/utils/Wallet/Wallet'
import defaultCATs from '~config/defaultCATs.json'

import WalletStore from './WalletStore'
class AssetsStore {
    walletStore: WalletStore

    existedAssets: IAsset[] = []

    availableAssets: IFetchData<Asset[]> = {
        isFetching: true,
        data: [],
    }

    balancesData: IFetchData<{ [key: string]: number }> = {
        isFetching: true,
        data: {},
    }

    exchangeRateData: IFetchData<IExchangeRate | null> = {
        isFetching: true,
        data: null,
    }

    constructor(walletStore: WalletStore) {
        makeAutoObservable(this)
        this.walletStore = walletStore

        onBecomeObserved(this, 'existedAssets', this.subscribeExistedAssets)
        onBecomeUnobserved(this, 'existedAssets', this.unsubscribeExistedAssets)
        onBecomeObserved(this, 'availableAssets', async () => {
            try {
                const assets = await callGetCATs()
                runInAction(() => {
                    this.availableAssets.data = assets || []
                    this.availableAssets.isFetching = false
                })
            } catch (error) {}
        })
    }

    get XCH() {
        return {
            assetId: '',
            code: chains[this.walletStore.chain.id].prefix.toUpperCase(),
            iconUrl: '/chia.png',
        }
    }

    get assets() {
        return [this.XCH, ...this.existedAssets]
    }

    getAssetByAssetId = (
        assetId: string,
        sources: ('existed' | 'available')[] = ['existed', 'available']
    ) => {
        if (assetId === this.XCH.assetId) return this.XCH
        const getAssetFromSource = (source: 'existed' | 'available') => {
            if (source === 'existed') {
                return this.existedAssets.find(
                    (asset) => asset.assetId === assetId
                )
            }
            const asset = this.availableAssets.data.find(
                (asset) => asset.assetId === assetId
            )
            return asset
                ? {
                      assetId: asset.assetId,
                      code: asset.code,
                      iconUrl: asset.icon,
                  }
                : asset
        }
        const asset = sources.reduce((acc, source) => {
            if (acc) return acc
            return getAssetFromSource(source)
        }, undefined as IAsset | undefined)
        return asset
    }

    addDefaultAsset = async () => {
        // Show USDS by default on mainnet
        try {
            rootStore.walletStore.db.assets.clear()
            defaultCATs[this.walletStore.chain.name].forEach(
                async (assetInfo) => {
                    await rootStore.walletStore.db.assets.add({
                        ...assetInfo,
                    })
                }
            )

            this.getAllBalances()
        } catch (e) {}
    }

    retrieveExistedAssets = async () => {
        const assets = await rootStore.walletStore.db.assets.toArray()

        runInAction(() => {
            this.existedAssets = assets
        })
    }

    unsubscribeExistedAssets = () => {}
    subscribeExistedAssets = () => {
        const observable = liveQuery(() =>
            rootStore.walletStore.db.assets.toArray()
        )
        const subscription = observable.subscribe({
            next: (result) => {
                runInAction(() => {
                    this.existedAssets = result
                })
            },
        })
        this.unsubscribeExistedAssets = () => subscription.unsubscribe()
    }

    getBalance = async (puzzleHashes: string[]): Promise<void> => {
        if (!puzzleHashes.length) {
            throw new Error('invalid empty puzzlehash list')
        }

        try {
            this.balancesData.isFetching = true

            const res = await callGetBalanceByPuzzleHashes({
                puzzleHashes,
            })

            const data = res?.data?.data

            runInAction(async () => {
                this.balancesData.isFetching = false
                this.balancesData.data = {
                    ...this.balancesData.data,
                    ...data,
                }
            })
        } catch (error) {
            runInAction(() => {
                this.balancesData.isFetching = false
            })
            console.error(error)
        }
    }

    getBalanceByPuzzleHash = (puzzleHash: string) => {
        return (this.balancesData.data?.[puzzleHash] ?? 0)?.toString() ?? '0'
    }

    getAllBalances = async () => {
        const puzzleHashes: string[] = [
            this.walletStore.puzzleHash,
            ...this.existedAssets.map((asset) =>
                this.assetIdToPuzzleHash(asset.assetId)
            ),
        ]

        await this.getBalance(puzzleHashes)
    }

    getCovertedBalanceByAsset = (assetId: string, puzzleHash: string) => {
        const isXCH = assetId === this.XCH.assetId

        if (isXCH) {
            const balance = parseFloat(
                mojoToXch(
                    this.getBalanceByPuzzleHash('0x' + puzzleHash)
                ).toFixed()
            )

            return balance
        } else {
            const balance = parseFloat(
                mojoToCat(
                    this.getBalanceByPuzzleHash(
                        this.assetIdToPuzzleHash(assetId)
                    )
                ).toFixed()
            )

            return balance
        }
    }

    getExchangeRate = async () => {
        try {
            this.exchangeRateData.isFetching = true

            const { data } = await callGetExchangeRate(
                '6d95dae356e32a71db5ddcb42224754a02524c615c5fc35f568c2af04774e589' // USDS Asset ID
            )

            runInAction(() => {
                this.exchangeRateData.isFetching = false
                this.exchangeRateData.data = data.cat[0]
            })
        } catch (error) {
            runInAction(() => {
                this.exchangeRateData.isFetching = false
                this.exchangeRateData.data = null
            })
        }
    }

    updateBalance = async (data): Promise<void> => {
        const assetId: string = data.metadata.assetId
        const puzzle_hash = assetId
            ? this.assetIdToPuzzleHash(assetId)
            : this.walletStore.puzzleHash
        const balanceData = await callGetBalance({
            puzzle_hash,
        })

        runInAction(() => {
            this.balancesData.data[puzzle_hash] = balanceData.data.data
        })
    }

    assetIdToPuzzleHash = (assetId: string) => {
        const assetIdHex = fromHex(assetId)
        const walletPrivateKey = Wallet.derivePrivateKey(
            this.walletStore.privateKey
        )
        const walletPublicKey = walletPrivateKey.getG1()
        const wallet = new Wallet(walletPublicKey, {
            hardened: true,
            index: 0,
        })
        const cat = new CAT(assetIdHex, wallet)
        return '0x' + cat.hashHex()
    }

    tailDatabaseImagePatch = async () => {
        const patchedId = `${this.walletStore.chain.name}_patched`
        const patched = await getStorage(patchedId)
        if (!patched) {
            await this.addDefaultAsset()
            await setStorage({ [patchedId]: true })
        }
    }
}

export default AssetsStore
