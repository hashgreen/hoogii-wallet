import { createPopup } from '~/api/extension/extension'
import Messaging from '~/api/extension/messaging'
import connectedSitesStore from '~/store/ConnectedSitesStore'
import { ChainEnum } from '~/types/chia'
import {
    IMessage,
    MethodEnum,
    PopupEnum,
    RequestArguments,
    RequestMethodEnum,
} from '~/types/extension'
import { StorageEnum } from '~/types/storage'
import { apiEndpointSets, chains } from '~/utils/constants'
import { getStorage, setStorage } from '~/utils/extension/storage'
import { puzzleHashToAddress } from '~/utils/signature'

import * as Errors from './errors'
import { permission } from './permission'

const chainId = async (): Promise<string | Errors.Error> => {
    const chainId = await getStorage<string>(StorageEnum.chainId)

    return chainId || Errors.InvalidParamsError
}

const connect = (origin: string): boolean => {
    return connectedSitesStore.isConnectedSite(origin)
}

const walletSwitchChain = async (params: {
    chainId: ChainEnum
}): Promise<any> => {
    if (apiEndpointSets[params.chainId]) {
        await setStorage({ chainId: params.chainId })
        return true
    }
    return Errors.InvalidParamsError
}

const accounts = async (): Promise<string[] | Errors.Error> => {
    const chainId = await getStorage<string>(StorageEnum.chainId)
    const puzzleHash = await getStorage<string>(StorageEnum.puzzleHash)
    const chain = chains.find((chain) => chain.id === chainId)
    if (!puzzleHash || !chain) {
        return Errors.NoSecretKeyError
    }

    const account = puzzleHashToAddress(puzzleHash, chain.prefix)
    return [account]
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
    const auth = await authHandler(request)
    if (!auth) {
        return Errors.UserRejectedRequestError
    }

    switch (request.data?.method) {
        case RequestMethodEnum.CHAIN_ID:
            return await chainId()
        case RequestMethodEnum.CONNECT:
            return connect(request.origin)
        case RequestMethodEnum.WALLET_SWITCH_CHAIN:
            return walletSwitchChain(request.data.params)
        case RequestMethodEnum.ACCOUNTS:
            return accounts()
        case RequestMethodEnum.GET_PUBLIC_KEYS:
            return Errors.UnderDevelopment
        case RequestMethodEnum.FILTER_UNLOCK_COINS:
            return Errors.UnderDevelopment
        case RequestMethodEnum.GET_ASSET_COINS:
            return Errors.UnderDevelopment
        case RequestMethodEnum.GET_ASSET_BALANCE:
            return Errors.UnderDevelopment
        case RequestMethodEnum.SIGN_COIN_SPENDS:
            return Errors.UnderDevelopment
        case RequestMethodEnum.SIGN_MESSAGE:
            return Errors.UnderDevelopment
        case RequestMethodEnum.SEND_TRANSACTION:
            return Errors.UnderDevelopment
        default:
            return Errors.InvalidParamsError
    }
}

export default requestHandler
