import fetchAdapter from '@vespaiach/axios-fetch-adapter'
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { registerMessageHandler } from 'axios-chrome-messaging-adapter'
import { toast } from 'react-toastify'

import { IAsset, IResponseData, ITransaction, RequestConfig } from '~/types/api'
import { ChainEnum } from '~/types/chia'
import { Asset } from '~/types/entities'
import { apiEndpointSets } from '~/utils/constants'
import { getErrorMessage, toastOption } from '~/utils/errorMessage'
import { getStorage } from '~/utils/extension/storage'

/** -------------------------- Full Node API -------------------------- */
registerMessageHandler({ adapter: fetchAdapter })

export async function apiHandler<T = any>(
    params: AxiosRequestConfig,
    config: RequestConfig = { isShowToast: true }
): Promise<AxiosResponse<T>> {
    try {
        const chainId: string = await getStorage<string>('chainId')

        const apiEndpoint = apiEndpointSets[chainId || ChainEnum.Mainnet].jarvan // default mainnet
        const request = axios.create({
            baseURL: apiEndpoint,
            timeout: 60 * 1000,
            adapter: fetchAdapter,
        })
        const res = await request.request<T>({ ...params })
        return res
    } catch (error) {
        const resError = error as AxiosError
        console.error('error', error)
        if (config.isShowToast) {
            const message = getErrorMessage(resError)
            toast.error(message, {
                ...toastOption,
                toastId: resError?.response?.data?.code?.toString() ?? 'none',
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
export const getPuzzleAndSolution = (params: AxiosRequestConfig) =>
    apiHandler({
        url: '/rpc/get_puzzle_and_solution',
        method: 'post',
        ...params,
    })
export const getFeesEstimate = (
    params: AxiosRequestConfig<{
        spend_bundle: object
        target_times: number[]
    }>
) => {
    return apiHandler<{
        estimates: number[]
        success: boolean
        target_times: number[]
        [key: string]: any
    }>({
        url: '/rpc/get_fee_estimate',
        method: 'POST',
        ...params,
    })
}

/** -------------------------- Full Node API  END-------------------------- */
/** -----------------------
 * --- Jarvan addon API -------------------------- */

export const callGetCATs = async () => {
    const res = await apiHandler<IResponseData<IAsset[]>>({
        url:
            apiEndpointSets[await getStorage<string>('chainId')]?.newJarvan +
            '/cats?catType=2&size=0',
    })
    return res.data.data?.map((item) => new Asset(item))
}

export const sendTx = (
    params: AxiosRequestConfig,
    config: RequestConfig = { isShowToast: false }
) => apiHandler({ url: '/addon/push_tx', method: 'post', ...params }, config)

export const getParseSpendBundle = (
    params: AxiosRequestConfig,
    config: RequestConfig = { isShowToast: false }
) =>
    apiHandler<IResponseData<ITransaction>>(
        {
            url: '/addon/parse_spend_bundle ',
            method: 'post',
            ...params,
        },
        config
    )

export const getSpendableCoins = (
    params: { puzzle_hash: string },
    config: RequestConfig = { isShowToast: false }
) =>
    apiHandler(
        {
            url: '/addon/get_coin_records_by_puzzle_hash',
            method: 'get',
            params,
        },
        config
    )
export const callGetBalance = (
    params: { puzzle_hash: string },
    config: RequestConfig = { isShowToast: true }
) =>
    apiHandler<GetBalanceRes>(
        {
            url: '/addon/get_balance',
            method: 'get',
            params,
        },
        config
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
        url: '/transactions',
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

/** -------------------------- Spacescan API -------------------------- */
export const callGetExchangeRate = (assetId: string) =>
    apiHandler(
        {
            url: `https://api2.spacescan.io/v0.1/xch/cat/${assetId}`,
            method: 'get',
        },
        { isShowToast: false }
    )
/** -------------------------- Spacescan API END -------------------------- */
