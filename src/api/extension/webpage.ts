import Messaging from '~/api/extension/messaging'
import { MethodEnum, RequestMethodEnum } from '~/types/extension'

import pkg from '../../../package.json'
export const enable = async () => {
    const response = await Messaging.toContent(MethodEnum.ENABLE)
    return response.data
}

export const lock = async () => await Messaging.toContent(MethodEnum.LOCK)

export const unlock = async () => await Messaging.toContent(MethodEnum.UNLOCK)

export const isConnected = async () =>
    await Messaging.toContent(MethodEnum.IS_CONNECTED)

export const request = async <T = any>({
    method,
    params,
}: {
    method: RequestMethodEnum
    params?: T
}) => await Messaging.toContent(MethodEnum.REQUEST, { method, params })

export const event = (eventName: string, callback: (arg: any) => void) => {
    const handler = (event) => callback(event.detail)

    const events = window.chia.hoogii._events[eventName] || []

    window.chia.hoogii._events[eventName] = [...events, [callback, handler]]

    window.addEventListener(`${pkg.name}${eventName}`, handler)
}
