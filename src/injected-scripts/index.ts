import { enable, isConnected, lock, unlock } from '~/api/extension/webpage'
import { RequestMethodEnum } from '~/types/extension'

import pkg from '../../package.json'

const underDevelopment = async () => {
    const error = {
        message: 'under development',
        code: 4006,
    }

    throw error
}
window.chia = {
    ...(window.chia || {}),
    hoogii: {
        name: 'Hoogii',
        apiVersion: '0.0.4',
        version: pkg.version,
        request: async ({ method }) => {
            console.log('method', method)
            switch (method) {
                case RequestMethodEnum.CHAIN_ID:
                    return underDevelopment()
                case RequestMethodEnum.CONNECT:
                    return underDevelopment()
                case RequestMethodEnum.WALLET_SWITCH_CHAIN:
                    return underDevelopment()
                case RequestMethodEnum.GET_PUBLIC_KEYS:
                    return underDevelopment()
                case RequestMethodEnum.FILTER_UNLOCK_COINS:
                    return underDevelopment()
                case RequestMethodEnum.GET_ASSET_COINS:
                    return underDevelopment()
                case RequestMethodEnum.GET_ASSET_BALANCE:
                    return underDevelopment()
                case RequestMethodEnum.SIGN_COIN_SPENDS:
                    return underDevelopment()
                case RequestMethodEnum.SING_MESSAGE:
                    return underDevelopment()
                case RequestMethodEnum.SEND_TRANSACTION:
                    return underDevelopment()
                default:
                    return underDevelopment()
            }
        },
        isConnected: async () => await isConnected(),
        lock: async () => await lock(),
        unlock: async () => await unlock(),
        enable: async () => {
            console.log('enable')
            if (await enable()) {
                return {
                    lock,
                    unlock,
                }
            }
        },
    },
}
