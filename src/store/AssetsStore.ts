import { fromHex } from '@rigidity/bls-signatures'
import { Program } from '@rigidity/clvm'
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
    callGetExchangeRate,
    callGetMarkets,
} from '~/api/api'
import { IAsset } from '~/db'
import rootStore from '~/store'
import { ICryptocurrency, IExchangeRate, IFetchData } from '~/types/api'
import { ChainEnum } from '~/types/chia'
import { CAT } from '~/utils/CAT'
import { getStorage, setStorage } from '~/utils/storage'
import { Wallet } from '~/utils/Wallet/Wallet'
import defaultCATs from '~config/defaultCATs.json'

import WalletStore from './WalletStore'
class AssetsStore {
    walletStore: WalletStore

    existedAssets: IAsset[] = []

    availableAssets: IFetchData<ICryptocurrency[]> = {
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
                const res = await callGetMarkets()
                const markets = res.data.data
                const assets = markets.map(
                    (market) => market[market.info_ccy_name] as ICryptocurrency
                )
                runInAction(() => {
                    this.availableAssets.data = assets
                    this.availableAssets.isFetching = false
                })
            } catch (error) {}
        })
    }

    get XCH() {
        return {
            assetId: 'XCH',
            code:
                this.walletStore.chain?.id === ChainEnum.Mainnet
                    ? 'XCH'
                    : 'TXCH',
            iconUrl: '/chia.png',
        }
    }

    get assets() {
        return [this.XCH, ...this.existedAssets]
    }

    addDefaultAsset = () => {
        // Show USDS by default on mainnet
        rootStore.walletStore.db.assets.clear()
        defaultCATs[this.walletStore.chain.name].forEach((assetInfo) => {
            rootStore.walletStore.db.assets.add({
                ...assetInfo,
            })
        })
    }

    retrieveExistedAssets = async () => {
        const assets = await rootStore.walletStore.db.assets.toArray()
        runInAction(() => {
            this.existedAssets = assets
        })
        return assets
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

    getBalance = async (puzzleHashes: string[]) => {
        if (!puzzleHashes.length) {
            return []
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

    getXCHBalance = async () => {
        const balances = await this.getBalance([this.walletStore.puzzleHash])
        return balances
    }

    getCATBalances = async () => {
        const puzzleHashes: string[] = this.existedAssets.map((asset) =>
            this.assetIdToPuzzleHash(asset.assetId)
        )
        const balances = await this.getBalance(puzzleHashes)
        return balances
    }

    getAllBalances = async () => {
        const puzzleHashes: string[] = [
            this.walletStore.puzzleHash,
            ...this.existedAssets.map((asset) =>
                this.assetIdToPuzzleHash(asset.assetId)
            ),
        ]

        const balances = await this.getBalance(puzzleHashes)
        return balances
    }

    getExchangeRate = async () => {
        try {
            this.exchangeRateData.isFetching = true

            const { data } = await callGetExchangeRate(
                defaultCATs[this.walletStore.chain.name].find(
                    (cat) => cat.code === 'USDS'
                )?.assetId ?? '' // USDS assetId
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

            console.error(error)
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

        return '0x' + Program.fromBytes(cat.hash()).toHex()
    }

    tailDateBaseImagePath = async () => {
        const patchTime = await getStorage('patchTime')
        if (!patchTime || patchTime < 1) {
            await this.addDefaultAsset()
            await setStorage({ patchTime: 1 })
        }
    }
}

export default AssetsStore
