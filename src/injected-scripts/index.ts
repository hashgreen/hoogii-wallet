import { event, isConnected, request } from '~/api/extension/webpage'

import pkg from '../../package.json'
window.chia = {
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
    on: (eventName, callback) => {
        event(eventName, callback)
    },
    _events: {},
}
