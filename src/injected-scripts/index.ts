import { event, isConnected, request } from '~/api/extension/webpage'

import pkg from '../../package.json'
window.chia = {
    name: pkg.name,
    apiVersion: '1.0.0', // chip02 version
    version: pkg.version,
    isHoogii: true,
    request: async (...arg) => {
        return (await request(...arg))?.data
    },
    on: (eventName, callback) => {
        event(eventName, callback)
    },
    isConnected: async () => (await isConnected()).data,
    _events: {},
}
