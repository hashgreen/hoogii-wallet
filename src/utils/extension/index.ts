import { makeObservable, observable, runInAction } from 'mobx'

import { ChainEnum } from '~/types/chia'
import {
    IMessage,
    InternalRequestType,
    InternalReturnType,
    MethodEnum,
    ReturnDataProps,
} from '~/types/extension'
import { chains } from '~/utils/constants'
import { decrypt, stringToBytes } from '~/utils/encryption'
import { getStorage, setStorage } from '~/utils/extension/storage'

export const retrieveChain = async () => {
    const chainId = await getStorage<string>('chainId')
    if (!chainId) {
        setStorage({ chainId: chains[ChainEnum.Mainnet].id })
    }
    const chain = chains[chainId] || chains[ChainEnum.Mainnet]
    return chain
}
export const retrieveSeed = async (password, keyring): Promise<Uint8Array> => {
    const { salt, cipherText } = keyring
    const plainText = await decrypt(salt, password, cipherText)

    return stringToBytes(plainText)
}

export class InternalStore {
    private port: chrome.runtime.Port
    private tabId?: number
    request?: IMessage

    constructor(portName: string) {
        makeObservable(this, {
            request: observable,
        })
        this.port = chrome.runtime.connect({
            name: portName,
        })
    }

    requestData = async () => {
        const tabId = await new Promise<number>((resolve) =>
            chrome.tabs.getCurrent((tab) => tab?.id && resolve(tab.id))
        )
        runInAction(() => {
            this.tabId = tabId
        })
        await new Promise((resolve) => {
            const messageHandler = (response: IMessage) => {
                this.port.onMessage.removeListener(messageHandler)
                runInAction(() => {
                    this.request = response
                    resolve(response)
                })
            }
            this.port.onMessage.addListener(messageHandler)
            this.port.postMessage({
                tabId,
                method: MethodEnum.REQUEST_DATA,
            } as InternalRequestType)
        })
    }

    returnData = ({ data, error }: ReturnDataProps) => {
        this.port.postMessage({
            data,
            error,
            method: MethodEnum.RETURN_DATA,
            tabId: this.tabId,
        } as InternalReturnType)
    }
}
