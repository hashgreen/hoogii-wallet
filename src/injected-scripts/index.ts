import {
    enable,
    isConnected,
    lock,
    request,
    unlock,
} from '~/api/extension/webpage'

import pkg from '../../package.json'
window.chia = {
    ...(window.chia || {}),
    hoogii: {
        name: 'Hoogii',
        apiVersion: '0.0.4',
        version: pkg.version,
        isHoogii: true,
        request: async (arg) => {
            const res = await request(arg)
            if (res?.data.error) {
                throw res?.data
            }
            return res?.data
        },
        isConnected: async () => await isConnected(),
        lock: async () => await lock(),
        unlock: async () => await unlock(),
        enable: async () => {
            if (await enable()) {
                return {
                    lock,
                    unlock,
                }
            }
        },
    },
}
