import fetchAdapter from '@vespaiach/axios-fetch-adapter'
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { registerMessageHandler } from 'axios-chrome-messaging-adapter'
import { toast } from 'react-toastify'

import { IResponseData, ITransaction, RequestConfig } from '~/types/api'
import { ChainEnum } from '~/types/chia'
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

/** -------------------------- Full Node API  END-------------------------- */
/** -----------------------
 * --- Jarvan addon API -------------------------- */

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
