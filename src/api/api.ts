import axios, { AxiosError, AxiosResponse } from 'axios'
import { toast } from 'react-toastify'

import { IMarket } from '~/types/api'
import { getErrorMessage, ToastOption } from '~/utils/errorMessage'

const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASEURL,
    timeout: 60 * 1000,
})
/** -------------------------- Full Node API -------------------------- */

export async function apiErrorToastHandler<T, D>(
    request: Promise<AxiosResponse<T, D>>,
    isShowToast: Boolean = true
): Promise<AxiosResponse<T, D>> {
    try {
        const res = await request
        return res
    } catch (error: any) {
        const resError: AxiosError = error
        if (isShowToast) {
            const message = getErrorMessage(resError?.response?.status)
            toast.error(message, {
                ...ToastOption,
                toastId: String(resError?.response?.status),
            })
        }
        throw resError?.response
    }
}
interface GetBalanceRes {
    data: number
    code: number
    msg: string
}

/**
 * callPushTransaction [Post]
 */
export const getCoinRecordsByName = (params) =>
    apiErrorToastHandler(request.post('/rpc/get_coin_record_by_name', params))
export const getPuzzleAndSolution = (params) =>
    apiErrorToastHandler(request.post('/rpc/get_puzzle_and_solution', params))
/** -------------------------- Full Node API  END-------------------------- */
/** -------------------------- Jarvan addon API -------------------------- */

export const sendTx = (params, isShowToast: Boolean = false) =>
    apiErrorToastHandler(request.post('/addon/push_tx', params), isShowToast)
export const getSpendableCoins = (params: { puzzle_hash: string }) =>
    apiErrorToastHandler(
        request.get('/addon/get_coin_records_by_puzzle_hash', { params })
    )
export const callGetBalance = (params: { puzzle_hash: string }) =>
    apiErrorToastHandler(
        request.get<GetBalanceRes>('/addon/get_balance', { params })
    )
export const callGetBalanceByPuzzleHashes = ({
    puzzleHashes,
}: {
    puzzleHashes: string[]
}) =>
    apiErrorToastHandler(
        request.get('/addon/get_balance_by_puzzle_hashes', {
            params: { puzzle_hashes: puzzleHashes.join(',') },
        })
    )
export const callGetTxByPuzzleHash = (params: {
    puzzle_hash: string
    type?: string
    page?: number
    size?: number
    status?: number
}) =>
    apiErrorToastHandler(
        request.get('/addon/get_tx_by_puzzle_hash', { params })
    )
/**
 * callGetAblyAccessToken [Post]
 */
export const callGetAblyAccessToken = (formData) =>
    apiErrorToastHandler(request.post('/auth', formData))
/** -------------------------- Jarvan addon API END -------------------------- */
/** -------------------------- Zed API -------------------------- */
export const callGetMarkets = () =>
    apiErrorToastHandler(
        request.get<AxiosResponse<IMarket[]>>(
            'https://testnet10.hash.green/api/v1/markets'
        )
    )

/** -------------------------- Zed API END -------------------------- */

/** -------------------------- Spacescan API -------------------------- */
export const callGetExchangeRate = (assetId: string) =>
    apiErrorToastHandler(
        request.get(`https://api2.spacescan.io/v0.1/xch/cat/${assetId}`)
    )
/** -------------------------- Spacescan API END -------------------------- */
