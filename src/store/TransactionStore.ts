import { AugSchemeMPL, fromHex, PrivateKey } from '@rigidity/bls-signatures'
import { Program } from '@rigidity/clvm'
import { AxiosError } from 'axios'
import { makeAutoObservable } from 'mobx'

import { callGetBalance, getSpendableCoins, sendTx } from '~/api/api'
import { IAsset } from '~/db'
import { CAT } from '~/utils/CAT'
import { xchToMojo } from '~/utils/CoinConverter'
import { getErrorMessage } from '~/utils/errorMessage'
import { getProgramBySeed } from '~/utils/signature'
import SpendBundle from '~/utils/SpendBundle'
import { Coin } from '~/utils/Wallet/types'
import { Wallet } from '~/utils/Wallet/Wallet'

import WalletStore from './WalletStore'
class TransactionStore {
    walletStore: WalletStore

    constructor(walletStore: WalletStore) {
        makeAutoObservable(this)
        this.walletStore = walletStore
    }

    get isTradable() {
        return !!this.walletStore.seed
    }

    static coinList = async (puzzle_hash: string): Promise<Coin[]> => {
        try {
            const res = await getSpendableCoins({
                puzzle_hash,
            })
            return (
                res?.data?.data?.map((record) => ({
                    ...record.coin,
                    amount: record.coin.amount || 0,
                })) ?? []
            )
        } catch (error) {
            throw new Error(getErrorMessage(error as AxiosError))
        }
    }

    sendXCHTx = async (
        targetAddress: string,
        amount: string,
        memo: string,
        fee: string
    ): Promise<void> => {
        const { seed, chain } = this.walletStore
        const { agg_sig_me_additional_data } = chain
        if (!seed) return
        const puzzleReveal = getProgramBySeed(seed)
        const balance = await callGetBalance(
            {
                puzzle_hash: puzzleReveal.hashHex(),
            },
            { isShowToast: false }
        )
        if (balance.data.data < BigInt(amount) + BigInt(fee)) {
            throw new Error("You don't have enough balance to send")
        }
        const spendableCoinList = await TransactionStore.coinList(
            puzzleReveal.hashHex()
        )
        try {
            const XCHspendsList = await Wallet.generateXCHSpendList({
                puzzleReveal,
                amount,
                memo,
                fee,
                targetAddress,
                spendableCoinList,
            })

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

            const spendBundle = new SpendBundle(XCHspendsList, XCHsignatures)
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
        memo: string,
        fee: string
    ): Promise<void> => {
        const { seed, address, chain } = this.walletStore
        const { agg_sig_me_additional_data } = chain
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
        const spendableCATList = await TransactionStore.coinList(
            Program.fromBytes(cat.hash()).toHex()
        )

        const CATspendsList = await CAT.generateCATSpendList({
            wallet,
            assetId,
            amount,
            memo,
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

        if (BigInt(xchToMojo(fee).toString()) > 0) {
            const XCHspendsList = await Wallet.generateXCHSpendList({
                puzzleReveal,
                amount: '0',
                memo: '', // memo is unnecessary for fee
                fee,
                address,
                targetAddress: address,
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
