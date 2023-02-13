import { generateMnemonicAsync, mnemonicToSeedAsync } from 'bip39-web'
import Joi from 'joi'
import { shuffle } from 'lodash'
import { isEqual, sampleSize } from 'lodash-es'
import {
    action,
    computed,
    makeObservable,
    observable,
    override,
    runInAction,
} from 'mobx'

import { savePassword } from '~/api/extension'
import RootStore from '~/store'
import { bcryptVerify } from '~/utils'
import { standardMnemonicLength } from '~/utils/constants'
import { bytesToString } from '~/utils/encryption'
import { getStorage } from '~/utils/extension/storage'
import words from '~config/wordlist_en.json'

import WalletStore from './WalletStore'
class MnemonicStore {
    walletStore: WalletStore
    mnemonics: string[] = ['']
    password: string = ''

    constructor(walletStore: WalletStore) {
        makeObservable(this, {
            mnemonics: observable,
            mnemonicPhrase: computed,
            schema: computed,
            create: action.bound,
            validate: action.bound,
            createRandomInputs: action.bound,
        })
        this.walletStore = walletStore
    }

    async create() {
        this.walletStore.saveKeyring(this.mnemonicPhrase, this.password)

        RootStore.assetsStore.addDefaultAsset()
    }

    get mnemonicPhrase(): string {
        return this.mnemonics.join(' ')
    }

    get schema() {
        return Joi.array()
            .length(standardMnemonicLength)
            .items(
                Joi.object({
                    value: Joi.string()
                        .valid(...words)
                        .required(),
                })
            )
            .custom((value, helpers) => {
                const values = value.map((item) => item.value)
                return this.validate(values)
                    ? value
                    : helpers.error('any.invalid')
            })
    }

    validate(mnemonics: string[]): boolean {
        return (
            mnemonics?.length === standardMnemonicLength &&
            mnemonics.every((item) => item.trim())
        )
    }

    createRandomInputs(quantity: number = 6): number[] {
        const indices = Array.from(
            { length: standardMnemonicLength },
            (_, i) => i
        )

        return shuffle(indices).slice(0, quantity)
    }

    setMnemonics = (mnemonics: string[]) => {
        runInAction(() => {
            this.mnemonics = mnemonics
        })
    }

    setPassWord = (value: string) => {
        runInAction(() => {
            this.password = value
        })
    }
}

export class CreateMnemonicStore extends MnemonicStore {
    constructor(walletStore: WalletStore) {
        super(walletStore)
        makeObservable(this, {
            schema: override,
            validate: override,
            create: override,
        })

        generateMnemonicAsync(256, undefined, words).then((mnemonics) => {
            runInAction(() => {
                this.mnemonics = mnemonics.split(' ')
            })
        })
    }

    validate(mnemonics: string[]): boolean {
        return super.validate(mnemonics) && isEqual(this.mnemonics, mnemonics)
    }
}

export class ImportMnemonicStore extends MnemonicStore {}

export class ResetMnemonicStore extends MnemonicStore {
    constructor(walletStore: WalletStore) {
        super(walletStore)
        makeObservable(this, {
            create: override,
            verifyMnemonic: action.bound,
        })
    }

    async verifyMnemonic(): Promise<boolean> {
        const seedHash = (await getStorage<string>('seedHash')) || ''
        const seed = await mnemonicToSeedAsync(this.mnemonicPhrase)
        const comparedSeedHash = await bcryptVerify(
            bytesToString(seed),
            seedHash
        )

        return comparedSeedHash
    }

    async create() {
        super.create()
        await savePassword(this.password)
    }
}

export default MnemonicStore
