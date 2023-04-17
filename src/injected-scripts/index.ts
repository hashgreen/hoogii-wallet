import {
    event,
    eventOff,
    isConnected,
    isLocked,
    request,
} from '~/api/extension/webpage'

import pkg from '../../package.json'

const hoogiiPrototype = {
    on: event,
    off: eventOff,
    _events: {},
}
const hoogii = Object.create(hoogiiPrototype)
Object.assign(hoogii, {
    name: pkg.name,
    apiVersion: '1.0.0', // chip02 version
    version: pkg.version,
    isHoogii: true,
    request: async (arg) => (await request(arg))?.data,
    isConnected: async () => (await isConnected())?.data,
    isUnlocked: async () => !(await isLocked())?.data,
})
if (window.chia) {
    window.chia.hoogii.dev = hoogii
} else {
    window.chia = {
        hoogii: {
            dev: hoogii,
        },
    }
}
