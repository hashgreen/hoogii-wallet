import { makeAutoObservable, runInAction } from 'mobx'

import { lockFromBackground, savePassword } from '~/api/extension'
import { WalletDexie } from '~/db'
import rootStore from '~/store'
import { ChainEnum } from '~/types/chia'
import {
    ConnectionName,
    IMessage,
    InternalRequestType,
    InternalReturnType,
    MethodEnum,
    PopupEnum,
    RequestMethodEnum,
    ReturnDataProps,
} from '~/types/extension'
import { StorageEnum } from '~/types/storage'
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
        await lockFromBackground()
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

    init = async (method: RequestMethodEnum) => {
        switch (method) {
            case RequestMethodEnum.CONNECT:
            case RequestMethodEnum.CREATE_OFFER:
            case RequestMethodEnum.TRANSFER:
            case RequestMethodEnum.SIGN_COIN_SPENDS:
                await rootStore.walletStore.init()
                if (!rootStore.walletStore.locked) {
                    await rootStore.assetsStore.tailDatabaseImagePatch()
                    await rootStore.assetsStore.retrieveExistedAssets()
                }
                break
            default:
                break
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
                this.init(
                    this.connected
                        ? response?.data.method
                        : RequestMethodEnum.CONNECT
                )
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

    connectedSite = async () => {
        const chainId = await getStorage<string>(StorageEnum.chainId)
        const db = new WalletDexie(chainId ?? ChainEnum.Mainnet)
        let connectedSites = await db.connectedSites.toArray()

        if (connectedSites.some((site) => site.url === this.request?.origin)) {
            runInAction(() => {
                this.connected = true
            })

            return
        }

        if (this.request?.origin) {
            await db.connectedSites.add({
                name: this.request?.origin,
                url: this.request?.origin,
                iconUrl: this.request?.iconUrl,
            })

            connectedSites = await db.connectedSites.toArray()
            runInAction(() => {
                this.connected = connectedSites.some(
                    (site) => site.url === this.request?.origin
                )
            })

            return
        }

        runInAction(() => {
            this.connected = false
        })
    }
}

const controller = new InternalControllerStore()

export default controller
