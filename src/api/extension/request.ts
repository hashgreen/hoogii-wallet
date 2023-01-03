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
import { apiEndpointSets } from '~/utils/constants'
import { getStorage, setStorage } from '~/utils/extension/storage'

import { permission } from './permission'

const chainId = async (): Promise<string> => {
    console.log('request >> chainId')
    const chainId: string = await getStorage<string>('chainId')
    return chainId || ChainEnum.Mainnet
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
    return {
        code: 4002,
        message: 'network not found',
    }
}
const requestConfirmHandler = async (request: IMessage<RequestArguments>) => {
    if (permission.DoubleCheck[request.data?.method as RequestMethodEnum]) {
        const tab = await createPopup(PopupEnum.INTERNAL)
        const res = await Messaging.toInternal<MethodEnum.REQUEST>(tab, request)
        return res?.data
    }

    return true
}

export const requestHandler = async (request: IMessage<RequestArguments>) => {
    const confirmed = await requestConfirmHandler(request)
    if (!confirmed) {
        return {
            error: true,
            code: 4002,
            message: 'Reject the request',
        }
    }

    switch (request.data?.method) {
        case RequestMethodEnum.CHAIN_ID:
            return await chainId()
        case RequestMethodEnum.CONNECT:
            return connect(request.origin)
        case RequestMethodEnum.WALLET_SWITCH_CHAIN:
            return walletSwitchChain(request.data.params)
        default:
            return {
                error: true,
                code: 401,
                message: 'Under development',
            }
    }
}

export default requestHandler
