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
import { getStorage } from '~/utils/extension/storage'

const chainId = async (): Promise<string> => {
    const chainId: string = await getStorage<string>('chainId')
    return chainId || ChainEnum.Mainnet
}

const connect = (origin: string): boolean => {
    return connectedSitesStore.isConnectedSite(origin)
}

const walletSwitchChain = (params: { chainId: ChainEnum }): boolean => {
    if (apiEndpointSets[params.chainId]) {
        return true
    }
    return false
}
export const requestHandler = async (request: IMessage<RequestArguments>) => {
    switch (request.data?.method) {
        case RequestMethodEnum.CHAIN_ID:
            return await chainId()
        case RequestMethodEnum.CONNECT:
            return connect(request.origin)
        case RequestMethodEnum.WALLET_SWITCH_CHAIN:
            if (request?.isConnected && !request.isLocked) {
                const tab = await createPopup(PopupEnum.INTERNAL)
                const res = await Messaging.toInternal<MethodEnum.REQUEST>(
                    tab,
                    request
                )
                if (!res?.data) {
                    return {
                        error: true,
                        code: 401,
                        message: 'Under development',
                    }
                }
            }

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
