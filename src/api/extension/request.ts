import connectedSitesStore from '~/store/ConnectedSitesStore'
import { ChainEnum } from '~/types/chia'
import {
    IMessage,
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

export const requestMethods = {
    [RequestMethodEnum.CHAIN_ID]: chainId,
    [RequestMethodEnum.CONNECT]: connect,
    [RequestMethodEnum.WALLET_SWITCH_CHAIN]: walletSwitchChain,
}
export const requestHandler = async (request: IMessage<RequestArguments>) => {
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
