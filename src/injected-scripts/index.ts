import {
    enable,
    isConnected,
    lock,
    request,
    unlock,
} from '~/api/extension/webpage'
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
        request: async (arg: { method: RequestMethodEnum }) => {
            await request(arg)
            return underDevelopment()
        },
        isConnected: async () => await isConnected(),
        lock: async () => await lock(),
        unlock: async () => await unlock(),
        enable: async () => {
            console.log('enable')
            if (await enable()) {
                console.log('enable end')
                return {
                    lock,
                    unlock,
                }
            }
        },
    },
}
