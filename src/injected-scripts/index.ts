import { isConnected, request } from '~/api/extension/webpage'

import pkg from '../../package.json'
window.chia = {
    name: 'Hoogii',
    apiVersion: '0.0.4',
    version: pkg.version,
    isHoogii: true,
    request: async (arg) => {
        return (await request(arg))?.data
    },
    isConnected: async () => await isConnected(),
    // lock: async () => await lock(),
    // unlock: async () => await unlock(),
    // enable: async () => {
    //     if (await enable()) {
    //         return {
    //             lock,
    //             unlock,
    //         }
    //     }
    // },
}
