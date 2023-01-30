import { uniqueId } from 'lodash-es'

import { permission } from '~/api/extension/permission'
import {
    IMessage,
    InternalRequestType,
    InternalReturnType,
    MethodDataType,
    MethodEnum,
    MethodReturnDataType,
    MethodType,
    SenderEnum,
    SendResponse,
} from '~/types/extension'

import pkg from '../../../package.json'

class Messaging {
    static createProxyController = () => {
        // handle messages from extension
        console.log('listen to messages from extension')
        chrome.runtime.onMessage.addListener(async (response: IMessage) => {
            if (
                response.sender !== SenderEnum.EXTENSION ||
                response.target !== SenderEnum.WEBPAGE
            ) {
                return
            }
            console.log(
                '[content script]:from extension >> ' + JSON.stringify(response)
            )

            const isConnectedRes = await this.toBackground<MethodEnum>({
                sender: SenderEnum.BACKGROUND,
                origin: response.origin,
                method: MethodEnum.IS_CONNECTED,
            })

            if (!isConnectedRes.data) {
                return
            }

            const event = new CustomEvent(`${pkg.name}${response.event}`, {
                detail: response.data,
            })
            window.dispatchEvent(event)
        })

        // handle messages from websites
        console.log('listen to messages from websites')
        window.addEventListener('message', async (e) => {
            const request = e.data as IMessage
            if (
                request.target !== SenderEnum.EXTENSION ||
                request.sender !== SenderEnum.WEBPAGE
            ) {
                return
            }
            console.log(
                '[content script]:from websites >> ' + JSON.stringify(request)
            )

            const isValidWalletRes =
                await this.toBackground<MethodEnum.IS_VALID_WALLET>({
                    ...request,
                    method: MethodEnum.IS_VALID_WALLET,
                })

            if (isValidWalletRes?.data?.error) {
                throw new Error(isValidWalletRes.data.message)
            }
            // before enable need to check if unlock
            const isLockRes = await this.toBackground<MethodEnum>({
                ...request,
                method: MethodEnum.IS_LOCK,
            })

            // only allow enable function, before checking for whitelisted
            const isConnectedRes = await this.toBackground<MethodEnum>({
                ...request,
                method: MethodEnum.IS_CONNECTED,
            })
            if (request.method === MethodEnum.IS_CONNECTED) {
                window.postMessage(isConnectedRes)
                return
            }
            if (
                permission.Authenticate[request.method] &&
                !isConnectedRes.data
            ) {
                await this.toBackground<MethodEnum>({
                    ...request,
                    method: MethodEnum.REFUSE,
                })
                return
            }

            const response = await this.toBackground<MethodEnum>({
                ...request,
                isConnected: Boolean(isConnectedRes.data),
                isLocked: Boolean(isLockRes.data),
            })
            console.log(
                '[content script]:from websites << ' + JSON.stringify(response)
            )
            window.postMessage(response)
        })
    }

    static toBackground = <T extends MethodEnum = any>({
        id,
        method,
        ...rest
    }: Partial<Omit<IMessage<MethodDataType<T>>, 'target'>> &
        Pick<
            Omit<IMessage<MethodDataType<T>>, 'target'>,
            'sender' | 'method'
        >) => {
        return new Promise<IMessage<MethodReturnDataType<T>>>((resolve) => {
            chrome.runtime.sendMessage(
                {
                    ...rest,
                    target: SenderEnum.BACKGROUND,
                    method,
                    id: id ?? uniqueId(`${MethodEnum[method]}_`),
                },
                (response) => resolve(response)
            )
        })
    }

    static toContent = <T extends MethodEnum>(
        method: T,
        data?: MethodDataType<T>
    ) => {
        return new Promise<IMessage<MethodReturnDataType<T>>>((resolve) => {
            const requestId = uniqueId(`${MethodEnum[method]}_`)
            window.addEventListener(
                'message',
                function responseHandler(
                    e: MessageEvent<IMessage<MethodReturnDataType<T>>>
                ) {
                    const response = e.data
                    if (
                        response.target !== SenderEnum.WEBPAGE ||
                        response.sender !== SenderEnum.EXTENSION ||
                        response.id !== requestId
                    ) {
                        return
                    }
                    console.log('to content << ' + JSON.stringify(response))

                    window.removeEventListener('message', responseHandler)

                    if (response.data?.error) {
                        throw response.data
                    }

                    resolve(response)
                }
            )
            console.log('to content >> ' + JSON.stringify(data))

            const favicon = document.querySelector(
                'link[rel="icon"]'
            ) as HTMLLinkElement
            const iconUrl = favicon?.href
            const origin = window.origin
            window.postMessage({
                id: requestId,
                method,
                data,
                iconUrl,
                origin,
                target: SenderEnum.EXTENSION,
                sender: SenderEnum.WEBPAGE,
            })
        })
    }

    static toInternal = <T extends MethodEnum>(
        tab: chrome.tabs.Tab,
        request: IMessage<MethodDataType<T>>
    ) => {
        return new Promise<InternalReturnType<T>>((resolve, reject) => {
            chrome.runtime.onConnect.addListener(function connectionHandler(
                port
            ) {
                port.onMessage.addListener(function messageHandler(
                    response: InternalReturnType<T> | InternalRequestType
                ) {
                    if (response.tabId !== tab.id) return
                    if (response.method === MethodEnum.REQUEST_DATA) {
                        port.postMessage(request)
                    }
                    if (response.method === MethodEnum.RETURN_DATA) {
                        if (!response.error) resolve(response)
                        else reject(new Error(response.error.message))
                    }
                    chrome.tabs.onRemoved.addListener(function tabsHandler(
                        tabId
                    ) {
                        if (tab.id !== tabId) return
                        chrome.runtime.onConnect.removeListener(
                            connectionHandler
                        )
                        port.onMessage.removeListener(messageHandler)
                        chrome.tabs.onRemoved.removeListener(tabsHandler)
                    })
                })
            })
        })
    }
}
export class BackgroundController {
    private methods: {
        [key in MethodEnum]?: MethodType<
            MethodDataType<key>,
            MethodReturnDataType<key>
        >
    }

    constructor() {
        this.methods = {}
    }

    add = <T extends MethodEnum>(
        method: T,
        func: MethodType<MethodDataType<T>, MethodReturnDataType<T>>
    ) => {
        this.methods[method as any] = func
    }

    listen = () => {
        chrome.runtime.onMessage.addListener(
            (request: IMessage, _, sendResponse: SendResponse) => {
                console.log(
                    `background >> ${JSON.stringify(request)}`,
                    this.methods[request.method]
                )
                this.methods[request.method]?.(request, sendResponse)
                return true
            }
        )
    }
}

export default Messaging
