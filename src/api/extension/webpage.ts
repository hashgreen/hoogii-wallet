import Messaging from '~/api/extension/messaging'
import { MethodEnum, RequestMethodEnum } from '~/types/extension'

export const enable = async () => {
    console.log('start enable')
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
