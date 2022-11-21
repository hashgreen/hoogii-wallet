import { enable, isConnected, lock, unlock } from '~/api/extension/webpage'

window.chia = {
    ...(window.chia || {}),
    hoogii: {
        name: 'Hoogii',
        apiVersion: '0.0.4',
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
