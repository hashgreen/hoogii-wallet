import { RequestArguments, RequestMethodEnum } from '~/types/extension'

const chainId = (): string => {
    return '0x01'
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
export const requestHandler = (arg: RequestArguments) => {
    const requestMethod = requestMethods[arg.method]
    console.log('requestMethod', requestMethod)
    if (requestMethod) {
        return requestMethod(arg.params)
    } else {
        return {
            error: true,
            code: 401,
            message: 'Under development',
        }
    }
}

export default requestHandler
