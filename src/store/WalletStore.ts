import { PrivateKey } from '@rigidity/bls-signatures'
import { mnemonicToSeedAsync } from 'bip39-web'
import { liveQuery } from 'dexie'
import {
    autorun,
    makeAutoObservable,
    onBecomeObserved,
    onBecomeUnobserved,
    reaction,
    runInAction,
} from 'mobx'

import {
    getDataFromMemory,
    lockFromBackground,
    savePassword,
} from '~/api/extension'
import { IAddress, IConnectedSite, WalletDexie } from '~/db'
import { walletTo0x02 } from '~/db/migrations'
import rootStore from '~/store'
import { ChainEnum, IChain } from '~/types/chia'
import { bcryptHash, bcryptVerify } from '~/utils'
import { chains } from '~/utils/constants'
import { bytesToString, decrypt, encrypt } from '~/utils/encryption'
import { retrieveChain, retrieveSeed } from '~/utils/extension'
import { seedToAddress, seedToPuzzle } from '~/utils/signature'
import {
    clearStorage,
    getStorage,
    removeItemsFromStorage,
    setStorage,
} from '~/utils/storage'

class WalletStore {
    isAblyConnected = false
    locked: boolean = false
    db: WalletDexie = new WalletDexie(ChainEnum.Mainnet)
    name?: string
    chain: IChain = chains[0]
    address: string = ''
    puzzleHash: string = ''
    addresses: IAddress[] = []
    connectedSites: IConnectedSite[] = []
    seed?: Uint8Array = new Uint8Array([])
    privateKey: PrivateKey = new PrivateKey(0n)

    editName = async (name?: string) => {
        try {
            if (name) {
                await setStorage({ name })
                this.name = name
            } else {
                await removeItemsFromStorage(['name'])
                this.name = undefined
            }
        } catch (error) {}
    }

    unsubscribeAddresses = () => {}
    subscribeAddresses = () => {
        const observable = liveQuery(() => this.db.addresses.toArray())
        const subscription = observable.subscribe({
            next: (result) => (this.addresses = result),
        })
        this.unsubscribeAddresses = () => subscription.unsubscribe()
    }

    unsubscribeConnectedSites = () => {}
    subscribeConnectedSites = () => {
        const observable = liveQuery(() => this.db.connectedSites.toArray())
        const subscription = observable.subscribe({
            next: (result) => (this.connectedSites = result),
        })
        this.unsubscribeConnectedSites = () => subscription.unsubscribe()
    }

    constructor() {
        makeAutoObservable(this)
        onBecomeObserved(this, 'addresses', this.subscribeAddresses)
        onBecomeUnobserved(this, 'addresses', this.unsubscribeAddresses)
        onBecomeObserved(this, 'connectedSites', this.subscribeConnectedSites)
        onBecomeUnobserved(
            this,
            'connectedSites',
            this.unsubscribeConnectedSites
        )

        autorun(() => {
            if (this.seed && !this.locked) {
                this.generateAddress(this.seed)
            }
        })
        reaction(
            () => this.chain,
            async (chain) => {
                if (chain) {
                    await this.dbMigration(chain)
                    runInAction(() => {
                        this.db = new WalletDexie(chain.id)
                    })
                }
            }
        )
    }

    get isMainnet(): boolean {
        return this.chain?.id === ChainEnum.Mainnet
    }

    get isWalletExisted(): boolean {
        return !!this.seed
    }

    init = async () => {
        const chain = await retrieveChain()
        const password = await getDataFromMemory<string>('password')
        const keyring = await getStorage<string>('keyring')

        if (keyring && password === '') {
            this.locked = true
            return
        }
        const seed = await retrieveSeed(password)
        const name = await getStorage<string>('name')
        runInAction(() => {
            this.chain = chain
            this.seed = seed
            this.name = name
        })
    }

    dbMigration = async (chain: IChain) => {
        switch (chain.id) {
            case ChainEnum.Testnet:
                await walletTo0x02(chain)
                break
            default:
                break
        }
    }

    generateAddress = async (seed: Uint8Array): Promise<void> => {
        if (!this.chain) return
        runInAction(() => {
            this.seed = seed
            this.privateKey = PrivateKey.fromSeed(seed)
            this.address = seedToAddress(seed, this.chain?.prefix ?? 'txch')
            this.puzzleHash = seedToPuzzle(seed).hashHex()
        })
    }

    logout = async () => {
        await clearStorage()
        await this.db.delete()
        if (chrome.runtime) {
            chrome.runtime.reload()
        } else {
            location.reload()
        }
    }

    switchChain = async (chain: IChain) => {
        rootStore.historyStore.history = []
        rootStore.historyStore.pendingHistory = []
        await setStorage({ chainId: chain.id })
        runInAction(() => {
            this.chain = chain
        })
        rootStore.assetsStore.addDefaultAsset()
    }

    checkPassword = async (password: string) => {
        try {
            const passwordHash = (await getStorage<string>('password')) || ''
            const result = await bcryptVerify(password, passwordHash)

            if (result) {
                await this.unlock(password)
            }
            return result
        } catch (error) {
            return false
        }
    }

    saveKeyring = async (mnemonicPhrase: string, password: string) => {
        const seed = await mnemonicToSeedAsync(mnemonicPhrase)
        const seedHash = await bcryptHash(bytesToString(seed))

        const encryptedData = await encrypt(password, bytesToString(seed))

        await setStorage({ keyring: encryptedData, seedHash })
        runInAction(() => {
            this.seed = seed
            this.privateKey = PrivateKey.fromSeed(seed)
            this.address = seedToAddress(seed, this.chain?.prefix ?? 'txch')
            this.puzzleHash = seedToPuzzle(seed).hashHex()
        })
    }

    updatePassword = async (password: string) => {
        savePassword(password)
        const keyring = await getStorage('keyring')
        const { salt, cipherText } = keyring
        const oldPassword = await getDataFromMemory<string>('password')
        const plainText = await decrypt(salt, oldPassword, cipherText)
        const encryptedData = await encrypt(password, plainText)

        await setStorage({ keyring: encryptedData })
    }

    lock = async () => {
        await lockFromBackground()
        runInAction(() => {
            this.locked = true
        })
    }

    unlock = async (password: string) => {
        const mnemonic = await getStorage<string>('mnemonic')
        if (mnemonic) {
            this.encryptKeyPatch(mnemonic, password)
        }

        await savePassword(password)

        runInAction(() => {
            this.locked = false
        })
    }

    encryptKeyPatch = async (originMnemonic: string, password: string) => {
        this.saveKeyring(originMnemonic, password)
        await removeItemsFromStorage(['mnemonic'])
    }
}

export default WalletStore
