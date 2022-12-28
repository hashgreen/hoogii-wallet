import { makeAutoObservable, runInAction } from 'mobx'

import { lock, savePassword } from '~/api/extension'
import {
    ConnectionName,
    IMessage,
    InternalRequestType,
    InternalReturnType,
    MethodEnum,
    PopupEnum,
    ReturnDataProps,
} from '~/types/extension'
import { bcryptVerify } from '~/utils'
import { getStorage } from '~/utils/extension/storage'

export class InternalControllerStore {
    private port: chrome.runtime.Port
    private tabId?: number
    request?: IMessage
    locked = true
    connected = false

    constructor() {
        makeAutoObservable(this)
        this.port = chrome.runtime.connect({
            name: ConnectionName[PopupEnum.INTERNAL],
        })

        this.requestData()
    }

    lock = async () => {
        await lock()
        runInAction(() => {
            this.locked = true
        })
    }

    unlock = async (password: string) => {
        await savePassword(password)
        runInAction(() => {
            this.locked = false
        })
    }

    checkPassword = async (password: string) => {
        try {
            const passwordHash = (await getStorage<string>('password')) || ''
            const result = await bcryptVerify(password, passwordHash)

            if (result) this.unlock(password)
            return result
        } catch (error) {
            return false
        }
    }

    requestData = async () => {
        const tabId = await new Promise<number>((resolve) =>
            chrome.tabs.getCurrent((tab) => tab?.id && resolve(tab.id))
        )
        runInAction(() => {
            this.tabId = tabId
        })
        const messageHandler = (response: IMessage) => {
            this.port.onMessage.removeListener(messageHandler)

            runInAction(() => {
                this.request = response
                this.locked = Boolean(response?.isLocked)
                this.connected = Boolean(response?.isConnected)
            })
        }
        this.port.onMessage.addListener(messageHandler)
        this.port.postMessage({
            tabId,
            method: MethodEnum.REQUEST_DATA,
        } as InternalRequestType)
    }

    returnData = ({ data, error }: ReturnDataProps) => {
        this.port.postMessage({
            data,
            error,
            method: MethodEnum.RETURN_DATA,
            tabId: this.tabId,
        } as InternalReturnType)
    }

    connectSite = async () => {
        runInAction(() => {
            this.connected = true
        })
    }

    onFinishRequest = async () => {
        this.returnData({
            data: true,
        })
        window.close()
    }
}

const controller = new InternalControllerStore()

export default controller
