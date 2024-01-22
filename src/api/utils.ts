import { ChainEnum } from '@hashgreen/hg-models'
import { ICAT, ITransaction, TxStatus, TxType } from '@hashgreen/hg-models/apis'
import {
    Coin as _Coin,
    SpendBundle as _SpendBundle,
} from '@hashgreen/hg-models/chia'
import { sanitizeHex } from '@rigidity/chia/dist/utils/hex'

import { ITxStatus, ITxType } from '~/components/Transaction/type'
import { Asset } from '~/types/entities'
import { getStorage } from '~/utils/extension/storage'
import praseHistory from '~/utils/praseHistory'
import SpendBundle from '~/utils/SpendBundle'
import { Coin } from '~/utils/Wallet/types'

import { apiEndpointName, apiEndpointSets } from './constants'
import { getErrorMessage, toastOption } from '~/utils/errorMessage'
import { toast } from 'react-toastify'

export const getApiEndpointSet = (chain: ChainEnum) => {
    const apiEndpointSet = apiEndpointSets[chain]
    if (!apiEndpointSet) {
        throw new Error(`Chain ${chain} is not supported`)
    }
    return apiEndpointSet
}

export const getApiEndpoint = async (name: apiEndpointName = 'jarvan') => {
    const chainId = await getStorage<string>('chainId')
    const apiEndpointSet = getApiEndpointSet(
        (chainId as ChainEnum) || ChainEnum.Mainnet
    )
    return apiEndpointSet[name]
}

export const transformCoins = (coin: _Coin): Coin => ({
    parent_coin_info: coin.parentCoinInfo,
    puzzle_hash: coin.puzzleHash,
    amount: coin.amount,
})

export const transformSpendBundles = (spendBundle: SpendBundle) => {
    return _SpendBundle.fromJSON(spendBundle.getObj())
}

export const transformCATToAsset = ({
    id,
    ...rest
}: Omit<ICAT, 'asset_id'> & { id: string }) =>
    new Asset({
        ...rest,
        asset_id: sanitizeHex(id),
    })

export const transformTxStatusToITxStatus = (status: TxStatus): ITxStatus => {
    switch (status) {
        case TxStatus.TX_STATUS_UNSPECIFIED:
            return ITxStatus.TX_STATUS_UNSPECIFIED
        case TxStatus.TX_STATUS_FAILED:
            return ITxStatus.TX_STATUS_FAILED
        case TxStatus.TX_STATUS_INIT:
            return ITxStatus.TX_STATUS_INIT
        case TxStatus.TX_STATUS_PUSHED:
            return ITxStatus.TX_STATUS_PUSHED
        case TxStatus.TX_STATUS_DROP:
            return ITxStatus.TX_STATUS_FAILED
        case TxStatus.TX_STATUS_IN_MEMPOOL:
            return ITxStatus.TX_STATUS_IN_MEMPOOL
        case TxStatus.TX_STATUS_ON_CHAIN:
            return ITxStatus.TX_STATUS_ON_CHAIN
    }
}

export const transformITxStatusToTxStatus = (status: ITxStatus): TxStatus => {
    switch (status) {
        case ITxStatus.TX_STATUS_UNSPECIFIED:
            return TxStatus.TX_STATUS_UNSPECIFIED
        case ITxStatus.TX_STATUS_FAILED:
            return TxStatus.TX_STATUS_FAILED
        case ITxStatus.TX_STATUS_INIT:
            return TxStatus.TX_STATUS_INIT
        case ITxStatus.TX_STATUS_PUSHED:
            return TxStatus.TX_STATUS_PUSHED
        case ITxStatus.TX_STATUS_IN_MEMPOOL:
            return TxStatus.TX_STATUS_IN_MEMPOOL
        case ITxStatus.TX_STATUS_ON_CHAIN:
            return TxStatus.TX_STATUS_ON_CHAIN
    }
}

export const transformTransactionToITransactionPrase = (
    tx: ITransaction
): Parameters<typeof praseHistory>[0] => {
    const { type, status, balance_changes, ...rest } = tx
    return {
        ...rest,
        type: ITxType[TxType[type]],
        status: transformTxStatusToITxStatus(status),
        balance_changes: Object.fromEntries(
            Object.entries(balance_changes).map(([key, value]) => [
                key,
                { asset_balance_change: value.asset_changes },
            ])
        ),
    }
}

export const errorToastHandler = (_error: unknown) => {
    const error = _error as Error
    const message = getErrorMessage(error)
    toast.error(message, {
        ...toastOption,
        toastId: message || 'none',
    })
}
