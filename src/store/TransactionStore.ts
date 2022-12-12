import { AugSchemeMPL, fromHex, PrivateKey } from '@rigidity/bls-signatures'
import { Coin } from '@rigidity/chia'
import { Program } from '@rigidity/clvm'
import { AxiosError } from 'axios'
import { makeAutoObservable } from 'mobx'

import { getSpendableCoins, sendTx } from '~/api/api'
import { IAsset } from '~/db'
import { CAT } from '~/utils/CAT'
import { getErrorMessage } from '~/utils/errorMessage'
import { addressToPuzzleHash, getProgramBySeed } from '~/utils/signature'
import SpendBundle from '~/utils/SpendBundle'
import { Wallet } from '~/utils/Wallet'

import WalletStore from './WalletStore'
const agg_sig_me_additional_data =
    'ae83525ba8d1dd3f09b277de18ca3e43fc0af20d20c4b3e92ef2a48bd291ccb2'

class TransactionStore {
    walletStore: WalletStore

    constructor(walletStore: WalletStore) {
        makeAutoObservable(this)
        this.walletStore = walletStore
    }

    get isTradable() {
        return !!this.walletStore.seed
    }

    coinList = async (puzzle_hash: string): Promise<Coin[]> => {
        try {
            const res = await getSpendableCoins({
                puzzle_hash,
            })
            return res?.data?.data.map((record) => ({
                ...record.coin,
                amount: record.coin.amount || 0,
            }))
        } catch (error) {
            throw new Error(getErrorMessage(error as AxiosError))
        }
    }

    sendXCHTx = async (
        targetAddress: string,
        amount: string,
        fee: string
    ): Promise<void> => {
        const { seed, address } = this.walletStore
        if (!seed) return
        const puzzleReveal = getProgramBySeed(seed).serializeHex()

        const spendableCoinList = await this.coinList(
            addressToPuzzleHash(address)
        )

        const XCHspendsList = await Wallet.generateXCHSpendList({
            puzzleReveal,
            amount,
            fee,
            address,
            targetAddress,
            spendableCoinList,
        })

        const XCHsignatures = AugSchemeMPL.aggregate(
            XCHspendsList.map((spend) =>
                Wallet.signCoinSpend(
                    spend,
                    Buffer.from(agg_sig_me_additional_data, 'hex'),
                    Wallet.derivePrivateKey(PrivateKey.fromSeed(seed)),
                    Wallet.derivePrivateKey(PrivateKey.fromSeed(seed)).getG1()
                )
            )
        )

        const spendBundle = new SpendBundle(XCHspendsList, XCHsignatures)
        try {
            await sendTx({
                data: { spend_bundle: spendBundle.getObj() },
            })
        } catch (error) {
            throw new Error(getErrorMessage(error as AxiosError))
        }
    }

    sendCATTx = async (
        targetAddress: string,
        asset: IAsset,
        amount: string,
        fee: string
    ): Promise<void> => {
        const { seed, address } = this.walletStore
        if (!seed) return
        const puzzleReveal = getProgramBySeed(seed).serializeHex()

        const masterPrivateKey = PrivateKey.fromSeed(seed)
        const walletPrivateKey = Wallet.derivePrivateKey(masterPrivateKey)
        const walletPublicKey = walletPrivateKey.getG1()

        const wallet = new Wallet(walletPublicKey, {
            hardened: true,
            index: 0,
        })

        const assetId = fromHex(asset.assetId)
        const cat = new CAT(assetId, wallet)
        const spendableCATList = await this.coinList(
            Program.fromBytes(cat.hash()).toHex()
        )

        const CATspendsList = await CAT.generateCATSpendList({
            wallet,
            assetId,
            amount,
            targetAddress,
            spendableCoinList: spendableCATList,
        })
        const spendList = [...CATspendsList]
        const CATsignatures = AugSchemeMPL.aggregate(
            CATspendsList.map((spend) =>
                Wallet.signCoinSpend(
                    spend,
                    Buffer.from(agg_sig_me_additional_data, 'hex'),
                    Wallet.derivePrivateKey(PrivateKey.fromSeed(seed)),
                    Wallet.derivePrivateKey(PrivateKey.fromSeed(seed)).getG1()
                )
            )
        )
        const signatureList = [CATsignatures]

        if (Number(fee) > 0) {
            const spendableCoinList = await this.coinList(
                addressToPuzzleHash(address)
            )
            const XCHspendsList = await Wallet.generateXCHSpendList({
                fee,
                puzzleReveal,
                amount: '0',
                address,
                targetAddress: address,
                spendableCoinList,
            })
            spendList.push(...XCHspendsList)
            const XCHsignatures = AugSchemeMPL.aggregate(
                XCHspendsList.map((spend) =>
                    Wallet.signCoinSpend(
                        spend,
                        Buffer.from(agg_sig_me_additional_data, 'hex'),
                        Wallet.derivePrivateKey(PrivateKey.fromSeed(seed)),
                        Wallet.derivePrivateKey(
                            PrivateKey.fromSeed(seed)
                        ).getG1()
                    )
                )
            )
            signatureList.push(XCHsignatures)
        }
        const spendBundle = new SpendBundle(
            spendList,
            AugSchemeMPL.aggregate(signatureList)
        )
        try {
            await sendTx({
                data: {
                    spend_bundle: spendBundle.getObj(),
                },
            })
        } catch (error) {
            throw new Error(getErrorMessage(error as AxiosError))
        }
    }
}

export default TransactionStore
