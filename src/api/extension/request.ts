import { fetchBalances } from '@hashgreen/hg-query/jarvan'
import { AugSchemeMPL, fromHex, PrivateKey } from '@rigidity/bls-signatures'
import { Program } from '@rigidity/clvm'
import { AxiosError } from 'axios'

import Messaging from '~/api/extension/messaging'
import { createPopup } from '~/api/extension/v3/extension'
import { getApiEndpoint } from '~/api/utils'
import connectedSitesStore from '~/store/ConnectedSitesStore'
import { ChainEnum } from '~/types/chia'
import {
    AssetCoinsParams,
    AssetCoinsTypeEnum,
    GetPublicKeysParams,
    IMessage,
    MempoolInclusionStatus,
    MethodEnum,
    PopupEnum,
    RequestArguments,
    RequestMethodEnum,
    SendTransactionParams,
    SignCoinSpendsParams,
} from '~/types/extension'
import { StorageEnum } from '~/types/storage'
import { CAT } from '~/utils/CAT'
import CoinSpend from '~/utils/CoinSpend'
import { apiEndpointSets, chains } from '~/utils/constants'
import { add0x } from '~/utils/encryption'
import { getStorage, setStorage } from '~/utils/extension/storage'
import Secure from '~/utils/Secure'
import { puzzleHashToAddress } from '~/utils/signature'
import { Wallet } from '~/utils/Wallet/Wallet'

import { getSpendableCoins, sendTx } from '../api'
import * as Errors from './errors'
import { permission } from './permission'
const connect = async (origin: string): Promise<boolean> => {
    return connectedSitesStore.isConnectedSite(origin)
}

const chainId = async (): Promise<string> => {
    const chainId = await getStorage<string>(StorageEnum.chainId)

    if (!chainId) {
        throw Errors.InvalidParamsError
    }
    return chainId
}

const walletSwitchChain = async (params: {
    chainId: ChainEnum
}): Promise<any> => {
    if (apiEndpointSets[params.chainId]) {
        await setStorage({ chainId: params.chainId })

        return true
    }
    throw Errors.InvalidParamsError
}

const accounts = async (): Promise<string[] | Errors.Error> => {
    const chainId = await getStorage<string>(StorageEnum.chainId)
    const puzzleHash = await getStorage<string>(StorageEnum.puzzleHash)
    const chain = chains[chainId]
    if (!puzzleHash || !chain) {
        throw Errors.NoSecretKeyError
    }

    const account = puzzleHashToAddress(puzzleHash, chain.prefix)

    return [account]
}
const getPublicKeys = async (
    params: GetPublicKeysParams
): Promise<string[]> => {
    const walletPublicKey = await Secure.getWalletPublicKey()
    const publicKeyList = [walletPublicKey.toHex()]
    const offset = params?.offset ?? 0
    const limit = params?.limit ?? publicKeyList.length
    return publicKeyList.slice(offset, offset + limit)
}
const getAssetCoins = async (params: AssetCoinsParams) => {
    const puzzle = await Secure.getPuzzle()

    let puzzleHash = puzzle.hashHex()
    if (params.assetId) {
        if (params.type === AssetCoinsTypeEnum.CAT) {
            const walletPublicKey = await Secure.getWalletPublicKey()
            const wallet = new Wallet(walletPublicKey, {
                hardened: true,
                index: 0,
            })
            const assetId = fromHex(params?.assetId)
            const cat = new CAT(assetId, wallet)
            puzzleHash = cat.hashHex()
        }

        if (params.type === AssetCoinsTypeEnum.NFT) {
            // TODO: develop when NFT implement
            throw Errors.UnderDevelopment
        }

        if (params.type === AssetCoinsTypeEnum.DID) {
            // TODO:develop when DID implement
            throw Errors.UnderDevelopment
        }
    }

    const spendableCoins =
        (
            await getSpendableCoins({
                puzzle_hash: puzzleHash,
            })
        ).data?.data ?? []

    const offset = params?.offset ?? 0
    const limit = params?.limit ?? 50
    const spendableCoinsWithLineageProof: any[] = []
    for (let i = offset; i < spendableCoins.length; i++) {
        const coinInfo = spendableCoins[i]

        let lineageProof
        if (params.assetId) {
            lineageProof = await CAT.getLineageProof(coinInfo.coin)
        }
        spendableCoinsWithLineageProof.push({
            coin: { ...coinInfo?.coin, amount: coinInfo?.coin?.amount || 0 },
            locked: false,
            coinName: `0x${Program.fromBytes(
                Wallet.coinName(coinInfo.coin)
            ).toHex()}`,
            puzzle: `0x${puzzle.hashHex()}`,
            confirmedBlockIndex: coinInfo.confirmed_block_index,
            lineageProof,
        })
        if (spendableCoinsWithLineageProof.length >= limit) {
            break
        }
    }

    return spendableCoinsWithLineageProof
}

const signCoinSpend = async ({ coinSpends }: SignCoinSpendsParams) => {
    const seed = await Secure.getSeed()
    const chainId =
        (await getStorage<string>(StorageEnum.chainId)) || ChainEnum.Mainnet
    const chain = chains[chainId]

    const spendList = coinSpends.map(
        (coinSpend) =>
            new CoinSpend(
                { ...coinSpend.coin, amount: BigInt(coinSpend.coin.amount) },
                coinSpend.puzzle_reveal,
                coinSpend.solution
            )
    )
    const signatures = AugSchemeMPL.aggregate(
        spendList
            .filter((spend) => spend.coin.amount)
            .map((item) =>
                Wallet.signCoinSpend(
                    item,
                    Buffer.from(chain.agg_sig_me_additional_data, 'hex'),
                    Wallet.derivePrivateKey(PrivateKey.fromSeed(seed)),
                    Wallet.derivePrivateKey(PrivateKey.fromSeed(seed)).getG1()
                )
            )
    )
    return add0x(signatures.toHex())
}

const getAssetBalance = async (params: {
    type: string | null
    assetId: string | null
}) => {
    let puzzleHash = await getStorage<string>(StorageEnum.puzzleHash)
    if (params.type === AssetCoinsTypeEnum.NFT) {
        // TODO: develop when NFT implement
        throw Errors.UnderDevelopment
    }

    if (params.type === AssetCoinsTypeEnum.DID) {
        // TODO:develop when DID implement
        throw Errors.UnderDevelopment
    }

    if (params.type === AssetCoinsTypeEnum.CAT) {
        if (!params.assetId) {
            throw Errors.InvalidParamsError
        }
        const walletPublicKey = await Secure.getWalletPublicKey()
        const wallet = new Wallet(walletPublicKey, {
            hardened: true,
            index: 0,
        })

        const assetId = fromHex(params.assetId)
        const cat = new CAT(assetId, wallet)
        puzzleHash = cat.hashHex()
    }

    const { [puzzleHash]: balance } = await fetchBalances({
        baseUrl: await getApiEndpoint(),
    })({
        puzzleHashes: [puzzleHash],
    })

    return { spendableCoinCount: balance }
}

const sendTransaction = async (params: SendTransactionParams) => {
    try {
        const res = await sendTx({
            data: {
                spend_bundle: params?.spendBundle,
            },
        })
        return {
            status: res?.data?.data,
        }
    } catch (error) {
        const resError = error as AxiosError

        return {
            status: MempoolInclusionStatus.FAILED,
            error: true,
            message: resError?.response?.data?.msg,
        }
    }
}

const authHandler = async (request: IMessage<RequestArguments>) => {
    if (permission.Skip[request.data?.method as RequestMethodEnum]) {
        return true
    }

    if (
        !request?.isConnected ||
        request?.isLocked ||
        permission.Confirm[request.data?.method as RequestMethodEnum]
    ) {
        const tab = await createPopup(
            PopupEnum.INTERNAL,
            request.data?.method
                ? Object.values(permission.Confirm).includes(
                      request.data?.method
                  )
                : false
        )
        const res = await Messaging.toInternal<MethodEnum.REQUEST>(tab, request)
        return res.data
    }

    return true
}
export const requestHandler = async (request: IMessage<RequestArguments>) => {
    // eager = true skip unlock
    if (
        request.data?.method === RequestMethodEnum.CONNECT &&
        request?.data?.params?.eager
    ) {
        request.isLocked = false
    }

    const response = await authHandler(request)
    if (!response) {
        throw Errors.UserRejectedRequestError
    }

    switch (request.data?.method) {
        case RequestMethodEnum.CONNECT:
            return connect(request.origin)
        case RequestMethodEnum.CHAIN_ID:
            return await chainId()
        case RequestMethodEnum.WALLET_SWITCH_CHAIN:
            return walletSwitchChain(request.data.params)
        case RequestMethodEnum.ACCOUNTS:
            return accounts()
        case RequestMethodEnum.TRANSFER:
            return response
        case RequestMethodEnum.GET_PUBLIC_KEYS:
            return getPublicKeys(request.data.params)
        case RequestMethodEnum.FILTER_UNLOCK_COINS:
            throw Errors.UnderDevelopment
        case RequestMethodEnum.GET_ASSET_COINS:
            return getAssetCoins(request.data.params)
        case RequestMethodEnum.GET_ASSET_BALANCE:
            return getAssetBalance(request.data.params)
        case RequestMethodEnum.SIGN_COIN_SPENDS:
            return signCoinSpend(request.data.params)
        case RequestMethodEnum.SIGN_MESSAGE:
            throw Errors.UnderDevelopment
        case RequestMethodEnum.SEND_TRANSACTION:
            return sendTransaction(request.data.params)
        case RequestMethodEnum.CREATE_OFFER:
            return response
        case RequestMethodEnum.TAKE_OFFER:
            throw Errors.UnderDevelopment

        default:
            throw Errors.InvalidParamsError
    }
}

export default requestHandler
