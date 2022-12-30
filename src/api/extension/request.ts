import { RequestArguments, RequestMethodEnum } from '~/types/extension'
import { getStorage } from '~/utils/extension/storage'

const chainId = async (): Promise<string> => {
    const chainId: string = await getStorage<string>('chainId')
    return chainId || '0x01'
}

const connect = (params: { eager?: boolean }): boolean => {
    console.log('params', params)
    return true
}

const accounts = (): string[] => {
    return []
}

const walletSwitchChain = (params: { chainId: string }): boolean => {
    console.log('params', params)
    return true
}

export const requestMethods = {
    [RequestMethodEnum.CHAIN_ID]: chainId,
    [RequestMethodEnum.CONNECT]: connect,
    [RequestMethodEnum.ACCOUNTS]: accounts,
    [RequestMethodEnum.WALLET_SWITCH_CHAIN]: walletSwitchChain,
}
export const requestHandler = async (arg: RequestArguments) => {
    const requestMethod = requestMethods[arg.method]
    if (requestMethod) {
        return await requestMethod(arg.params)
    } else {
        return {
            error: true,
            code: 401,
            message: 'Under development',
        }
    }
}

export default requestHandler
