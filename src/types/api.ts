export interface IResponseData<T> {
    code: number
    data?: T
    msg: string
}

interface IBase {
    created_at: string
    updated_at: string
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
