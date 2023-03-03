import { AugSchemeMPL, fromHex, PrivateKey } from '@rigidity/bls-signatures'
import { Program } from '@rigidity/clvm'

import { createPopup } from '~/api/extension/extension'
import Messaging from '~/api/extension/messaging'
import connectedSitesStore from '~/store/ConnectedSitesStore'
import { ChainEnum } from '~/types/chia'
import {
    AssetCoinsParams,
    AssetCoinsTypeEnum,
    IMessage,
    MethodEnum,
    PopupEnum,
    RequestArguments,
    RequestMethodEnum,
    SignCoinSpendsParams,
} from '~/types/extension'
import { StorageEnum } from '~/types/storage'
import { CAT } from '~/utils/CAT'
import CoinSpend from '~/utils/CoinSpend'
import { apiEndpointSets, chains } from '~/utils/constants'
import { getStorage, setStorage } from '~/utils/extension/storage'
import Secure from '~/utils/Secure'
import { puzzleHashToAddress } from '~/utils/signature'
import { Wallet } from '~/utils/Wallet/Wallet'

import { getSpendableCoins } from '../api'
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
        }

        if (params.type === AssetCoinsTypeEnum.DID) {
            // TODO:develop when DID implement
        }
    }

    const spendableCoins =
        (
            await getSpendableCoins({
                puzzle_hash: puzzleHash,
            })
        ).data?.data ?? []

    const offset = params?.offset ?? 0

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
        if (
            params?.limit &&
            spendableCoinsWithLineageProof.length >= params.limit
        ) {
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
    return signatures.toHex()
}

const authHandler = async (request: IMessage<RequestArguments>) => {
    if (
        !request?.isConnected ||
        request?.isLocked ||
        permission.Confirm[request.data?.method as RequestMethodEnum]
    ) {
        const tab = await createPopup(PopupEnum.INTERNAL)
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
            throw Errors.UnderDevelopment
        case RequestMethodEnum.FILTER_UNLOCK_COINS:
            throw Errors.UnderDevelopment
        case RequestMethodEnum.GET_ASSET_COINS:
            return getAssetCoins(request.data.params)
        case RequestMethodEnum.GET_ASSET_BALANCE:
            throw Errors.UnderDevelopment
        case RequestMethodEnum.SIGN_COIN_SPENDS:
            return signCoinSpend(request.data.params)
        case RequestMethodEnum.SIGN_MESSAGE:
            throw Errors.UnderDevelopment
        case RequestMethodEnum.SEND_TRANSACTION:
            return response
        case RequestMethodEnum.CREATE_OFFER:
            return response
        case RequestMethodEnum.TAKE_OFFER:
            throw Errors.UnderDevelopment

        default:
            throw Errors.InvalidParamsError
    }
}

export default requestHandler
