import axios, { AxiosResponse } from 'axios'

import { IMarket } from '~/types/api'

const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASEURL,
})
/** -------------------------- Full Node API -------------------------- */

interface GetBalanceRes {
    data: number
    code: number
    msg: string
}
/**
 * callGetUTXO [Get]
 */
export const callGetUTXO = (params) =>
    request.post('/rpc/get_coin_records_by_puzzle_hash', {
        ...params,
        include_spent_coins: false,
    })

/**
 * callPushTransaction [Post]
 */
export const getCoinRecordsByName = (params) =>
    request.post('/rpc/get_coin_record_by_name', params)
export const getPuzzleAndSolution = (params) =>
    request.post('/rpc/get_puzzle_and_solution', params)
/** -------------------------- Full Node API  END-------------------------- */
/** -------------------------- Jarvan addon API -------------------------- */

export const sendTx = (params) => request.post('/addon/push_tx', params)
export const getSpendableCoins = (params: { puzzle_hash: string }) =>
    request.get('/addon/get_coin_records_by_puzzle_hash', { params })
export const callGetBalance = (params: { puzzle_hash: string }) =>
    request.get<GetBalanceRes>('/addon/get_balance', { params })
export const callGetBalanceByPuzzleHashes = ({
    puzzleHashes,
}: {
    puzzleHashes: string[]
}) =>
    request.get('/addon/get_balance_by_puzzle_hashes', {
        params: { puzzle_hashes: puzzleHashes.join(',') },
    })
export const callGetTxByPuzzleHash = (params: {
    puzzle_hash: string
    type?: string
    page?: number
    size?: number
    status?: number
}) => request.get('/addon/get_tx_by_puzzle_hash', { params })
/**
 * callGetAblyAccessToken [Post]
 */
export const callGetAblyAccessToken = (formData) =>
    request.post('/auth', formData)
/** -------------------------- Jarvan addon API END -------------------------- */
export const getMarkets = () =>
    request.get<AxiosResponse<IMarket[]>>(
        'https://testnet10.hash.green/api/v1/markets'
    )
