export enum IType {
    Offer = 'offer',
    Send = 'send',
    Receive = 'receive',
    Coinbase = 'coinbase',
}

export interface ITransaction {
    amount: number
    secondAmount?: number
    fee: number
    onClick?: () => void
    createdAt: Date
    cname: string
    assetId: string
    receiver: string
    sender: string
    txType: ITxType
    txId: string
    action: string
    status: ITxStatus
}
export enum ITxStatus {
    TX_STATUS_UNSPECIFIED = 0,
    TX_STATUS_FAILED = 1,
    TX_STATUS_INIT = 2,
    TX_STATUS_PUSHED = 3,
    TX_STATUS_IN_MEMPOOL = 4,
    TX_STATUS_ON_CHAIN = 5,
}
export enum ITxType {
    TX_TYPE_UNSPECIFIED = 0,
    TX_TYPE_COINBASE = 1,
    TX_TYPE_STANDARD_TRANSFER = 2,
    TX_TYPE_CAT_MINT = 3,
    TX_TYPE_CAT_TRANSFER = 4,
    TX_TYPE_CAT_MELT = 5,
    TX_TYPE_OFFER1_SWAP = 6,
    TX_TYPE_UNKNOWN = 99,
}
