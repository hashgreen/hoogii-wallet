import {
    ITransaction,
    ITransactionPrase,
    ITxType,
} from '~/components/Transaction/type'

export const praseHistory = (
    {
        fee,
        created_at,
        status,
        type,
        name,
        balance_changes,
        updated_at,
        memos,
    }: ITransactionPrase,
    myPuzzleHash: string
): ITransaction => {
    const myBalanceChanges =
        balance_changes[myPuzzleHash]?.asset_balance_change || {}

    // find my asset and sort
    const myAssetBalances = Object.entries(myBalanceChanges)
        .map(([key, value]) => ({ assetId: key, ...value }))
        .sort((a, b) => {
            const aAmount = a.amount ?? Number.NEGATIVE_INFINITY
            const bAmount = b.amount ?? Number.NEGATIVE_INFINITY

            if (bAmount !== aAmount) {
                // sort by amount in descending order
                return bAmount - aAmount
            }
            // sort by assetId in descending order
            return b.assetId.localeCompare(a.assetId)
        })

    // find first asset
    const myAssetBalanceChange = myAssetBalances?.[0]
    const assetId = myAssetBalanceChange?.assetId || ''
    const amount = myAssetBalanceChange?.amount || 0

    // get action
    let action = type === ITxType.TX_TYPE_OFFER1_SWAP ? 'offer' : ''
    if (
        type === ITxType.TX_TYPE_CAT_TRANSFER ||
        type === ITxType.TX_TYPE_STANDARD_TRANSFER
    ) {
        action = amount >= 0 ? 'receive' : 'send'
        // if send to myself, then action is send
        if (Object.values(balance_changes).length === 1) {
            action = 'send'
        }
    }
    const anotherPuzzleHash =
        Object.entries(balance_changes).find(([key, value]) => {
            // for send to myself
            const checkAnotherPuzzleHash =
                Object.values(balance_changes).length === 1
                    ? true
                    : key !== myPuzzleHash

            const assetBalanceChange = value.asset_balance_change
            return (
                checkAnotherPuzzleHash &&
                Object.keys(assetBalanceChange).some((key) => {
                    return key === assetId
                })
            )
        })?.[0] || ''

    return {
        assetId,
        cname: '',
        txType: type,
        fee,
        receiver: anotherPuzzleHash,
        sender: anotherPuzzleHash,
        createdAt: new Date(created_at),
        updatedAt: new Date(updated_at),
        txId: name,
        amount,
        memos,
        action,
        status,
        myAssetBalances,
    }
}

export default praseHistory
