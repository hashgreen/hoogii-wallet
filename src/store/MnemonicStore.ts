import { generateMnemonicAsync, mnemonicToSeedAsync } from 'bip39-web'
import Joi from 'joi'
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
import { bytesToString } from '~/utils/encryption'
import { getStorage } from '~/utils/extension/storage'
import words from '~config/wordlist_en.json'

import WalletStore from './WalletStore'
class MnemonicStore {
    walletStore: WalletStore
    mnemonicLength: number = 24
    mnemonics: string[] = ['']
    password?: string

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
        const { mnemonicPhrase, password } = this

        if (mnemonicPhrase && password) {
            this.walletStore.saveKeyring(mnemonicPhrase, password)
        }

        RootStore.assetsStore.addDefaultAsset()
    }

    get mnemonicPhrase(): string {
        return this.mnemonics.join(' ')
    }

    get schema() {
        return Joi.array()
            .length(this.mnemonicLength)
            .items(
                Joi.object({
                    value: Joi.string()
                        .valid('', ...words)
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

    static toMnemonics = (mnemonicPhrase: string) => mnemonicPhrase.split(' ')

    static createMnemonics = async () =>
        this.toMnemonics(await generateMnemonicAsync(256, undefined, words))

    validate(mnemonics: string[]): boolean {
        return mnemonics?.length === 24 && mnemonics.every((item) => item)
    }

    createRandomInputs(randomCount: number = 6): [
        {
            [k: string]: string
        },
        (value: { [k: string]: string }) => boolean
    ] {
        const randomInputs = Object.fromEntries(
            sampleSize(this.mnemonics, randomCount).map((word) => [word, ''])
        )
        const validate = (value: { [k: string]: string }) =>
            Object.entries(value).every(([k, v]) => k === v)

        return [randomInputs, validate]
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
        MnemonicStore.createMnemonics().then((mnemonics) => {
            runInAction(() => {
                this.mnemonics = mnemonics
            })
        })
    }

    get schema() {
        return Joi.array()
            .length(this.mnemonicLength)
            .items(
                ...(this.mnemonics ?? []).map((phrase) =>
                    Joi.object({
                        value: Joi.string().valid(phrase).required(),
                    })
                )
            )
    }

    validate(mnemonics: string[]) {
        return super.validate(mnemonics) && isEqual(this.mnemonics, mnemonics)
    }

    async create() {
        super.create()
        RootStore.assetsStore.addDefaultAsset()
    }
}

export class ImportMnemonicStore extends MnemonicStore {
    constructor(walletStore: WalletStore) {
        super(walletStore)
        makeObservable(this, { create: override })
    }

    async create() {
        super.create()
        RootStore.assetsStore.addDefaultAsset()
    }
}

export class ResetMnemonicStore extends MnemonicStore {
    constructor(walletStore: WalletStore) {
        super(walletStore)
        makeObservable(this, {
            schema: override,
            validate: override,
            create: override,
        })
    }

    get schema() {
        return Joi.array()
            .length(this.mnemonicLength)
            .items(
                Joi.object({
                    value: Joi.string()
                        .valid(...words)
                        .required(),
                })
            )
            .custom(async (value, helpers) => {
                const values = value.map((item) => item.value)
                // display specific fields error
                // instead of mnemonic mismatched error
                // if (values.some((item) => !words.includes(item))) return value

                return (await super.validate(values))
                    ? value
                    : helpers.error('any.invalid')
            })
    }

    async verifyMnemonic(mnemonics?: string[]): Promise<boolean> {
        const seedHash = (await getStorage<string>('seedHash')) || ''

        const seed = await mnemonicToSeedAsync(mnemonics?.join(' ') || '')
        const comparedSeedHash = await bcryptVerify(
            bytesToString(seed),
            seedHash
        )

        return comparedSeedHash
    }

    async create() {
        const { password } = this ?? {}

        if (password) {
            await savePassword(password)

            this.walletStore.saveKeyring(this.mnemonics?.join(' '), password)
        }
    }
}

export default MnemonicStore
