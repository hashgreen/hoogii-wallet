import { AugSchemeMPL, fromHex, PrivateKey } from '@rigidity/bls-signatures'
import { addressInfo } from '@rigidity/chia'
import { Program } from '@rigidity/clvm'
import { AxiosError } from 'axios'
import { makeAutoObservable } from 'mobx'

import { callGetBalance, sendTx } from '~/api/api'
import { IAsset } from '~/db'
import { CAT } from '~/utils/CAT'
import { getErrorMessage } from '~/utils/errorMessage'
import { getProgramBySeed } from '~/utils/signature'
import SpendBundle from '~/utils/SpendBundle'
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

    sendXCHTx = async (
        targetAddress: string,
        amount: string,
        fee: string,
        memos?: string[]
    ): Promise<void> => {
        const { seed, chain } = this.walletStore
        const { agg_sig_me_additional_data } = chain
        if (!seed) return
        const puzzle = getProgramBySeed(seed)
        const balance = await callGetBalance(
            {
                puzzle_hash: puzzle.hashHex(),
            },
            { isShowToast: false }
        )
        if (BigInt(balance.data.data) < BigInt(amount) + BigInt(fee)) {
            throw new Error("You don't have enough balance to send")
        }
        const spendableCoinList = await Wallet.getCoinList(puzzle.hashHex())
        try {
            // generate coinSpend[]
            const XCHspendsList = await Wallet.generateXCHSpendList({
                puzzle,
                amount: BigInt(amount),
                memos,
                fee: BigInt(fee),
                targetPuzzleHash: Program.fromBytes(
                    addressInfo(targetAddress).hash
                ).toHex(),
                spendableCoinList,
            })
            // sign coin spend
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
        fee: string,
        memos?: string[]
    ): Promise<void> => {
        const { seed, address, chain } = this.walletStore
        const { agg_sig_me_additional_data } = chain
        if (!seed) return
        const puzzle = getProgramBySeed(seed)

        const masterPrivateKey = PrivateKey.fromSeed(seed)
        const walletPrivateKey = Wallet.derivePrivateKey(masterPrivateKey)
        const walletPublicKey = walletPrivateKey.getG1()
        // standard transaction program
        const wallet = new Wallet(walletPublicKey, {
            hardened: true,
            index: 0,
        })

        const assetId = fromHex(asset.assetId)
        const cat = new CAT(assetId, wallet)
        const spendableCATList = await Wallet.getCoinList(cat.hashHex())
        const {
            data: { data },
        } = await callGetBalance({
            puzzle_hash: cat.hashHex(),
        })

        if (BigInt(data) < BigInt(amount)) {
            throw new Error("You don't have enough coin to spend")
        }

        const CATspendsList = await CAT.generateCATSpendList({
            wallet,
            assetId,
            amount: BigInt(amount),
            memos,
            targetPuzzleHash: Program.fromBytes(
                addressInfo(targetAddress).hash
            ).toHex(),
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
        // Add fee by standardTx coinSpend
        if (BigInt(fee) > 0n) {
            const spendableCoinList = await Wallet.getCoinList(puzzle.hashHex())
            const XCHspendsList = await Wallet.generateXCHSpendList({
                puzzle,
                amount: 0n,
                fee: BigInt(fee),
                spendableCoinList,
                targetPuzzleHash: Program.fromBytes(
                    addressInfo(address).hash
                ).toHex(),
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
