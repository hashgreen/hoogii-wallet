import { AxiosError } from 'axios'

import { getErrorMessage } from '~/utils/errorMessage'
import { Coin } from '~/utils/Wallet/types'

import { getSpendableCoins } from './api'

const getCoinList = async (puzzle_hash: string): Promise<Coin[]> => {
    try {
        const res = await getSpendableCoins({
            puzzle_hash,
        })
        return (
            res?.data?.data?.map((record) => ({
                ...record.coin,
                amount: BigInt(record.coin.amount || 0),
            })) ?? []
        )
    } catch (error) {
        throw new Error(getErrorMessage(error as AxiosError))
    }
}
export default getCoinList
