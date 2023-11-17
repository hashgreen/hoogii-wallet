export interface IResponseData<T> {
    code: number
    data?: T
    msg: string
}

export interface RequestConfig {
    isShowToast: boolean
}

interface IBase {
    created_at: string
    updated_at: string
}

export interface IAsset {
    code: string
    name: string
    icon: string
    asset_id: string
}

export interface ICryptocurrency extends IBase {
    id: string
    asset_id: string
    code: string
    name: string
    description: string
    type: number
    status: number
    icon_url: string
    links: { [key: string]: string }
    launch_at: string
    min_amount_display: string
    max_supply_display: string
    total_supply_display: string
    circulating_supply_display: string
}
export interface IMarket extends IBase {
    id: string
    base_ccy: ICryptocurrency
    quote_ccy: ICryptocurrency
    code: string
    status: number
    info_ccy_name: string
    is_new: boolean
}
export interface IExchangeRate extends IBase {
    asset_id: string
    asset_name: string
    symbol: string
    price_usd: string
    price_xch: string
}

export interface IFetchData<T> {
    isFetching: boolean
    data: T
}

export interface ITransaction extends IBase {
    cost: number
    created_by: string
    depth: number
    fee: number
    header_hash: string
    height: number
    metadata: {
        amount: number
        asset_id: string
        from_puzzle_hash: string
        memos: string[]
        to_puzzle_hashes: string[]
    }
    name: string
    status: number
    timestamp: number
    type: number
}
