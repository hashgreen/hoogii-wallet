import { AugSchemeMPL, fromHex, PrivateKey } from '@rigidity/bls-signatures'
import { addressInfo } from '@rigidity/chia'
import { Program } from '@rigidity/clvm'

import { CAT } from '~/utils/CAT'
import _CoinSpend from '~/utils/CoinSpend'
import { getProgramBySeed } from '~/utils/signature'
import SpendBundle from '~/utils/SpendBundle'
import { Coin } from '~/utils/Wallet/types'
import { Wallet } from '~/utils/Wallet/Wallet'

export interface ICreateSpendBundleParams {
    seed: Uint8Array
    asset?: string
    amount: string
    memos?: string[]
    fee?: string
    targetAddress: string
}

export const createWallet = (seed: Uint8Array) => {
    const masterPrivateKey = PrivateKey.fromSeed(seed)
    const walletPrivateKey = Wallet.derivePrivateKey(masterPrivateKey)
    const walletPublicKey = walletPrivateKey.getG1()
    // standard transaction program
    return new Wallet(walletPublicKey, {
        hardened: true,
        index: 0,
    })
}

export const createSpendList = async (
    {
        seed,
        asset,
        amount,
        memos = [],
        fee = '0',
        targetAddress,
    }: ICreateSpendBundleParams,
    spendableCoinList: Coin[]
) => {
    const isXCH = !asset
    if (isXCH) {
        return await Wallet.generateXCHSpendList({
            puzzle: getProgramBySeed(seed),
            amount: BigInt(amount),
            memos,
            fee: BigInt(fee),
            targetPuzzleHash: Program.fromBytes(
                addressInfo(targetAddress).hash
            ).toHex(),
            spendableCoinList,
        })
    } else {
        const wallet = createWallet(seed)
        return await CAT.generateCATSpendList({
            wallet,
            assetId: fromHex(asset),
            amount: BigInt(amount),
            memos,
            targetPuzzleHash: Program.fromBytes(
                addressInfo(targetAddress).hash
            ).toHex(),
            spendableCoinList,
        })
    }
}

export const createSignatures = (
    seed: Uint8Array,
    spendList: _CoinSpend[],
    agg_sig_me_additional_data: string
) => {
    const masterPrivateKey = PrivateKey.fromSeed(seed)
    const walletPrivateKey = Wallet.derivePrivateKey(masterPrivateKey)
    const walletPublicKey = walletPrivateKey.getG1()
    return AugSchemeMPL.aggregate(
        spendList.map((spend) =>
            Wallet.signCoinSpend(
                spend,
                Buffer.from(agg_sig_me_additional_data, 'hex'),
                walletPrivateKey,
                walletPublicKey
            )
        )
    )
}

export const createSpendBundle = async (
    {
        seed,
        asset,
        amount,
        memos = [],
        fee = '0',
        targetAddress,
    }: ICreateSpendBundleParams,
    agg_sig_me_additional_data: string
) => {
    const isXCH = !asset

    // * Spendable Coin List
    const spendableCoinList = await Wallet.getCoinList(
        (isXCH
            ? getProgramBySeed(seed)
            : new CAT(fromHex(asset), createWallet(seed))
        ).hashHex()
    )
    // * Spend List
    const spendList = await createSpendList(
        { seed, asset, amount, memos, fee, targetAddress },
        spendableCoinList
    )
    // * Signatures
    const signatures = createSignatures(
        seed,
        spendList,
        agg_sig_me_additional_data
    )
    if (isXCH || BigInt(fee) <= 0n) {
        return new SpendBundle(spendList, signatures)
    }

    // * handle none zero fee in XCH when interact with CAT
    const spendableCoinListFee = await Wallet.getCoinList(
        getProgramBySeed(seed).hashHex()
    )
    const spendListFee = await createSpendList(
        { seed, asset, amount, memos, fee, targetAddress },
        spendableCoinListFee
    )
    const signaturesFee = createSignatures(
        seed,
        spendListFee,
        agg_sig_me_additional_data
    )

    return new SpendBundle(
        [...spendList, ...spendListFee],
        AugSchemeMPL.aggregate([signatures, signaturesFee])
    )
}
