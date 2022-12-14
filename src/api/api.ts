import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { toast } from 'react-toastify'

import { IMarket } from '~/types/api'
import { getErrorMessage, ToastOption } from '~/utils/errorMessage'

const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASEURL,
    timeout: 60 * 1000,
})
/** -------------------------- Full Node API -------------------------- */

export async function apiHandler<T = any>(
    params: AxiosRequestConfig,
    isShowToast: boolean = true
): Promise<AxiosResponse<T>> {
    try {
        const res = await request.request<T>({ ...params })
        return res
    } catch (error) {
        const resError = error as AxiosError
        if (isShowToast) {
            const message = getErrorMessage(resError)
            toast.error(message, {
                ...ToastOption,
                toastId: String(resError?.response?.data?.code),
            })
        }
        throw resError
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
export const getCoinRecordsByName = (params: AxiosRequestConfig) =>
    apiHandler({
        url: '/rpc/get_coin_record_by_name',
        method: 'post',
        ...params,
    })
export const getPuzzleAndSolution = (params: AxiosRequestConfig) =>
    apiHandler({
        url: '/rpc/get_puzzle_and_solution',
        method: 'post',
        ...params,
    })

/** -------------------------- Full Node API  END-------------------------- */
/** -------------------------- Jarvan addon API -------------------------- */

export const sendTx = (
    params: AxiosRequestConfig,
    isShowToast: boolean = false
) =>
    apiHandler(
        { url: '/addon/push_tx', method: 'post', ...params },
        isShowToast
    )
export const getSpendableCoins = (
    params: { puzzle_hash: string },
    isShowToast: boolean = false
) =>
    apiHandler(
        {
            url: '/addon/get_coin_records_by_puzzle_hash',
            method: 'get',
            params,
        },
        isShowToast
    )
export const callGetBalance = (
    params: { puzzle_hash: string },
    isShowToast: boolean = true
) =>
    apiHandler<GetBalanceRes>(
        {
            url: '/addon/get_balance',
            method: 'get',
            params,
        },
        isShowToast
    )

export const callGetBalanceByPuzzleHashes = ({
    puzzleHashes,
}: {
    puzzleHashes: string[]
}) =>
    apiHandler({
        url: '/addon/get_balance_by_puzzle_hashes',
        method: 'get',
        params: { puzzle_hashes: puzzleHashes.join(',') },
    })

export const callGetTxByPuzzleHash = (params: {
    puzzle_hash: string
    type?: string
    page?: number
    size?: number
    status?: number
}) =>
    apiHandler({
        url: '/addon/get_tx_by_puzzle_hash',
        method: 'get',
        params,
    })

/**
 * callGetAblyAccessToken [Post]
 */
export const callGetAblyAccessToken = (formData) =>
    apiHandler({
        url: '/auth',
        method: 'post',
        data: formData,
    })
/** -------------------------- Jarvan addon API END -------------------------- */
/** -------------------------- Zed API -------------------------- */
export const callGetMarkets = () =>
    apiHandler<AxiosResponse<IMarket[]>>({
        url: 'https://testnet10.hash.green/api/v1/markets',
        method: 'get',
    })

/** -------------------------- Zed API END -------------------------- */

/** -------------------------- Spacescan API -------------------------- */
export const callGetExchangeRate = (assetId: string) =>
    apiHandler({
        url: `https://api2.spacescan.io/v0.1/xch/cat/${assetId}`,
        method: 'get',
    })
/** -------------------------- Spacescan API END -------------------------- */
