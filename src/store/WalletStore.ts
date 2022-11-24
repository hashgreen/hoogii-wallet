import { PrivateKey } from '@rigidity/bls-signatures'
import { mnemonicToSeedAsync } from 'bip39-web'
import { liveQuery } from 'dexie'
import {
    autorun,
    makeAutoObservable,
    onBecomeObserved,
    onBecomeUnobserved,
    runInAction,
} from 'mobx'

import { getDataFromMemory, lock, savePassword } from '~/api/extension'
import { unlock } from '~/api/extension/webpage'
import { db, IAddress, IConnectedSite } from '~/db'
import { IChain } from '~/types/chia'
import { bcryptHash, bcryptVerify } from '~/utils'
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
    mnemonicLength = 24
    name?: string
    password: string = ''
    chain?: IChain
    address: string = ''
    puzzleHash: string = ''
    addresses: IAddress[] = []
    connectedSites: IConnectedSite[] = []
    seed: Uint8Array = new Uint8Array([])
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
        const observable = liveQuery(() => db.addresses.toArray())
        const subscription = observable.subscribe({
            next: (result) => (this.addresses = result),
        })
        this.unsubscribeAddresses = () => subscription.unsubscribe()
    }

    unsubscribeConnectedSites = () => {}
    subscribeConnectedSites = () => {
        const observable = liveQuery(() => db.connectedSites.toArray())
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
    }

    init = async () => {
        const chain = await retrieveChain()

        const password = await getDataFromMemory('password')
        const mnemonic = await getStorage<string>('mnemonic')
        const keyring = await getStorage<string>('keyring')
        if (mnemonic && !keyring) {
            // patch the version has mnemonic
            return {
                seed: new Uint8Array(),
                password: 'CREATE_NEW_PASSWORD',
                locked: true,
            }
        }
        if (keyring && !password) {
            return { seed: new Uint8Array(), password, locked: true }
        }
        const seed = await retrieveSeed(password)
        const name = await getStorage<string>('name')
        const locked = false
        if (!seed) {
            return { seed, locked }
        }
        runInAction(() => {
            this.chain = chain
            this.seed = seed
            this.name = name
            this.locked = locked
        })
        return { seed, locked }
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
        await db.delete()
        if (chrome.runtime) {
            chrome.runtime.reload()
        } else {
            location.reload()
        }
    }

    switchChain = async (chain: IChain) => {
        await setStorage({ chainId: chain.id })
        runInAction(() => {
            this.chain = chain
        })
    }

    checkPassword = async (password: string) => {
        try {
            const passwordHash = (await getStorage<string>('password')) || ''
            const result = await bcryptVerify(password, passwordHash)

            if (result) {
                this.unlock(password)
                this.password = password
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
        await lock()
        runInAction(() => {
            this.locked = true
        })
    }

    unlock = async (password: string) => {
        const mnemonic = await getStorage<string>('mnemonic')
        if (mnemonic) {
            this.encryptKeyPatch(mnemonic, password)
        }

        savePassword(password)
        await unlock()
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