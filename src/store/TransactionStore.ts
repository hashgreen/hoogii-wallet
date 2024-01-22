import { fetchBalances } from '@hashgreen/hg-query/jarvan'
import { fetchFeeEstimate, pushTx } from '@hashgreen/hg-query/thresh'
import { AugSchemeMPL, fromHex, PrivateKey } from '@rigidity/bls-signatures'
import { addressInfo } from '@rigidity/chia'
import { Program } from '@rigidity/clvm'
import { AxiosError } from 'axios'
import { makeAutoObservable } from 'mobx'

import {
    errorToastHandler,
    getApiEndpoint,
    transformSpendBundles,
} from '~/api/utils'
import { CAT } from '~/utils/CAT'
import { createSpendBundle, ICreateSpendBundleParams } from '~/utils/chia'
import { mojoToXch } from '~/utils/CoinConverter'
import { add0x } from '~/utils/encryption'
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
        return !!this.walletStore.seed.length
    }

    createTransferSpendBundle = async ({
        asset,
        amount,
        memos,
        fee,
        targetAddress,
    }: Omit<ICreateSpendBundleParams, 'seed'>) => {
        const { seed, chain } = this.walletStore
        const { agg_sig_me_additional_data } = chain
        if (!seed.length) return
        const spendBundle = await createSpendBundle(
            { seed, asset, amount, memos, targetAddress, fee },
            agg_sig_me_additional_data
        )
        return spendBundle
    }

    getFees = async (
        spendBundle: SpendBundle,
        targetTimes: number[] = import.meta.env.VITE_FEES_TARGET_TIMES.split(
            ' '
        ).map(Number)
    ) => {
        try {
            const estimates = await fetchFeeEstimate({
                baseUrl: await getApiEndpoint('thresh'),
            })({
                spendBundle: transformSpendBundles(spendBundle),
                targetTimes,
            })
            return targetTimes.map((time) => ({
                time,
                fee: mojoToXch(estimates[time]).toDecimalPlaces(12).toNumber(),
            }))
        } catch (error) {
            errorToastHandler(error)
        }
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
        const puzzleHash = puzzle.hashHex()
        try {
            const { [add0x(puzzleHash)]: balance = 0 } = await fetchBalances({
                baseUrl: await getApiEndpoint(),
            })({
                puzzleHashes: [add0x(puzzleHash)],
            })
            if (BigInt(balance) < BigInt(amount) + BigInt(fee)) {
                throw new Error("You don't have enough balance to send")
            }
            const spendableCoinList = await Wallet.getCoinList(puzzle.hashHex())
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

            await pushTx({
                baseUrl: await getApiEndpoint('thresh'),
            })({
                spendBundle: transformSpendBundles(spendBundle),
            })
        } catch (error) {
            throw new Error(getErrorMessage(error as Error))
        }
    }

    sendCATTx = async (
        targetAddress: string,
        asset: string,
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

        const assetId = fromHex(asset)
        const cat = new CAT(assetId, wallet)
        const spendableCATList = await Wallet.getCoinList(cat.hashHex())
        const puzzleHash = cat.hashHex()
        try {
            const { [add0x(puzzleHash)]: balance = 0 } = await fetchBalances({
                baseUrl: await getApiEndpoint(),
            })({
                puzzleHashes: [add0x(puzzleHash)],
            })
            if (BigInt(balance) < BigInt(amount)) {
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
                        Wallet.derivePrivateKey(
                            PrivateKey.fromSeed(seed)
                        ).getG1()
                    )
                )
            )
            const signatureList = [CATsignatures]
            // Add fee by standardTx coinSpend
            if (BigInt(fee) > 0n) {
                const spendableCoinList = await Wallet.getCoinList(
                    puzzle.hashHex()
                )
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
            await pushTx({
                baseUrl: await getApiEndpoint('thresh'),
            })({
                spendBundle: transformSpendBundles(spendBundle),
            })
        } catch (error) {
            throw new Error(getErrorMessage(error as Error))
        }
    }
}

export default TransactionStore
