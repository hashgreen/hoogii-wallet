import { isConnected, request } from '~/api/extension/webpage'

import pkg from '../../package.json'
window.chia = {
    name: 'Hoogii',
    apiVersion: '1.0.0',
    version: pkg.version,
    isHoogii: true,
    request: async (arg) => {
        return (await request(arg))?.data
    },
    isConnected: async () => (await isConnected()).data,
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
