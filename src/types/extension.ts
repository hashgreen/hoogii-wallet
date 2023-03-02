export interface IMessage<T = any> {
    id: string
    sender: SenderEnum
    target: SenderEnum
    origin: string
    iconUrl: string
    method: MethodEnum
    isLocked: boolean
    isConnected?: boolean
    event?: string
    data?: T
}

export type ReturnDataProps<T extends MethodEnum = any> =
    | { data: MethodReturnDataType<T>; error?: any }
    | { data?: MethodReturnDataType<T>; error: any }

export type InternalRequestType = {
    method: MethodEnum.REQUEST_DATA
    tabId: number
}

export type InternalReturnType<T extends MethodEnum = any> = {
    method: MethodEnum.RETURN_DATA
    tabId: number
} & ReturnDataProps<T>

export type SendResponse<T = any> = (request: IMessage<T>) => void

export type MethodType<T = any, R = T> = (
    request: IMessage<T>,
    sendResponse: SendResponse<R>
) => Promise<void>

export enum SenderEnum {
    BACKGROUND = 'BACKGROUND',
    EXTENSION = 'hoogii-wallet',
    WEBPAGE = 'WEBPAGE',
}

export enum MethodEnum {
    ENABLE = 'ENABLE',
    LOCK = 'LOCK',
    UNLOCK = 'UNLOCK',
    IS_LOCK = 'IS_LOCK',
    IS_CONNECTED = 'IS_CONNECTED',
    IS_VALID_WALLET = 'IS_VALID_WALLET',
    SAVE_DATA = 'SAVE_DATA',
    REFUSE = 'REFUSE',
    REQUEST = 'REQUEST',
    EVENT = 'EVENT',
    // internal
    REQUEST_DATA = 'REQUEST_DATA',
    RETURN_DATA = 'RETURN_DATA',
    MNEMONIC = 'MNEMONIC',
    RESET_PASSWORD = 'RESET_PASSWORD',
    SWITCH_CHAIN = 'SWITCH_CHAIN',
}

export enum RequestMethodEnum {
    CHAIN_ID = 'chainId',
    CONNECT = 'connect',
    ACCOUNTS = 'accounts',
    WALLET_SWITCH_CHAIN = 'walletSwitchChain',
    GET_PUBLIC_KEYS = 'getPublicKeys',
    FILTER_UNLOCK_COINS = 'filterUnlockedCoins',
    GET_ASSET_COINS = 'getAssetCoins',
    GET_ASSET_BALANCE = 'getAssetBalance',
    SIGN_COIN_SPENDS = 'signCoinSpends',
    SIGN_MESSAGE = 'signMessage',
    SEND_TRANSACTION = 'sendTransaction',
    TRANSFER = 'transfer',
    CREATE_OFFER = 'createOffer',
    TAKE_OFFER = 'takeOffer',
}

export enum EventEnum {
    CHAIN_CHANGED = 'chainChanged',
}

export interface RequestArguments {
    method: RequestMethodEnum
    params?: any
}

export type MethodDataType<T extends MethodEnum> = {
    ENABLE: {
        title: string
        iconUrl: string
    }
    REQUEST: RequestArguments
    EVENT: { method: EventEnum }
    LOCK: undefined
    UNLOCK: undefined
    IS_LOCK: any
    IS_CONNECTED: undefined
    REFUSE: undefined
    IS_VALID_WALLET: undefined
    MNEMONIC: undefined
    RESET_PASSWORD: undefined
    REQUEST_DATA: {
        [key: string]: any
    }
    RETURN_DATA: undefined
    SAVE_DATA: {
        password?: string
    }
    SWITCH_CHAIN: undefined
}[T]
interface ILock {
    success: boolean
}
interface IIsValidWallet {
    error: boolean
    code: number
    message: string
}
export type MethodReturnDataType<T extends MethodEnum> = {
    ENABLE: boolean
    REQUEST: any
    EVENT: boolean
    LOCK: ILock
    UNLOCK: ILock
    IS_LOCK: boolean
    IS_CONNECTED: boolean
    REFUSE: undefined
    IS_VALID_WALLET: IIsValidWallet
    MNEMONIC: undefined
    RESET_PASSWORD: undefined
    REQUEST_DATA: {
        [key: string]: any
    }
    RETURN_DATA: undefined
    SAVE_DATA: undefined
    SWITCH_CHAIN: { chainId: string }
}[T]
export enum StorageEnum {
    ASSETS = 'assets',
    ADDRESSES = 'addresses',
    CONNECTED_SITES = 'connectedSites',
}

export enum PopupEnum {
    INTERNAL = 'popup',
}

export const POPUP_WINDOW = {
    top: 50,
    left: 100,
    width: 400,
    height: 600,
} as const

export const ConnectionName = {
    [PopupEnum.INTERNAL]: 'internal-background-popup-communication',
} as const

export const APIError = {
    REFUSED: {
        code: -3,
        message:
            'The request was refused due to lack of access - e.g. wallet disconnects.',
    },
} as const
export interface OfferAsset {
    amount: number
    assetId?: string
    memo?: string
}
export interface OfferParams {
    requestAssets: OfferAsset[]
    offerAssets: OfferAsset[]
}
export interface TransferParams {
    to: string
    amount: string
    memos: string[]
    assetId: string
}

export enum OfferTypeEnum {
    REQUEST = 'REQUEST',
    OFFER = 'OFFER',
}
