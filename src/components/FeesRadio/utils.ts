import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { formatDuration } from '~/utils/i18n'

export interface IFeeOption {
    key: 'fast' | `medium-${number}` | 'medium' | 'slow'
    fee: string
    note: string
    description?: string
}

export const createDefaultFeeOptions = ({
    t,
}: Pick<
    ReturnType<typeof useTranslation<'translation', undefined>>,
    't'
>): IFeeOption[] => [
    {
        key: 'fast',
        fee: '0',
        note: t('send-fee-slow'),
    },
    {
        key: 'medium',
        fee: '0.00005',
        note: t('send-fee-medium'),
    },
    {
        key: 'fast',
        fee: '0.005',
        note: t('send-fee-fast'),
    },
]

export const createFeeOptions = (
    _fees: { time: number; fee: number }[],
    {
        t,
        i18n,
    }: Pick<
        ReturnType<typeof useTranslation<'translation', undefined>>,
        't' | 'i18n'
    >
): IFeeOption[] => {
    const fees = _fees.filter((fee) => {
        const isUnique = !_fees.find(
            (_fee) => _fee.fee === fee.fee && _fee.time !== fee.time
        )
        const isFastest = !_fees.find(
            (_fee) => _fee.fee === fee.fee && _fee.time < fee.time
        )
        return isUnique || isFastest
    })
    const mediumFees = fees.slice(1, fees.length - 1)
    const formatFee = (fee: number) => {
        return fee.toString()
    }
    if (!fees.length) return []
    let feeOptions: IFeeOption[] = [
        {
            key: 'slow',
            fee: formatFee(fees[0].fee),
            note: t('send-fee-slow'),
            description: t('send-fee-option_description', {
                context: 'slow',
            }),
        },
    ]
    if (mediumFees.length) {
        feeOptions = [
            ...feeOptions,
            ...mediumFees.map(
                (fee) =>
                    ({
                        key: `medium-${fee}`,
                        fee: formatFee(fee.fee),
                        note: t('send-fee-medium'),
                        description: t('send-fee-option_description', {
                            time: formatDuration(fee.time, i18n.language),
                        }),
                    } as IFeeOption)
            ),
        ]
    }
    if (fees.length > 1) {
        const { time, fee } = fees[fees.length - 1]
        feeOptions = [
            ...feeOptions,
            {
                key: 'fast',
                fee: formatFee(fee),
                note: t('send-fee-fast'),
                description: t('send-fee-option_description', {
                    time: formatDuration(time, i18n.language),
                }),
            },
        ]
    }
    return feeOptions
}

export const useDynamicFeeOptions = (
    defaultFeeOptions: IFeeOption[],
    update: () => Promise<IFeeOption[] | undefined>
) => {
    const [feeOptions, setFeeOptions] = useState(defaultFeeOptions)
    const [isLoading, setIsLoading] = useState(false)
    const updateFees = async () => {
        setIsLoading(true)
        const options = await update()
        options && setFeeOptions(options)
        setIsLoading(false)
    }

    useEffect(() => {
        updateFees()
    }, [])

    return {
        feeOptions,
        isLoading,
    }
}
