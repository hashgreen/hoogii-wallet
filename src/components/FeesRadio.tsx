import classNames from 'classnames'
import { FieldValues, Path, UseFormRegister } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'react-tooltip'

import { IAsset } from '~/db'
import { formatDuration } from '~/utils/i18n'
import InfoIcon from '~icons/hoogii/info.jsx'

interface IReactHookFormProps<T extends FieldValues> {
    register: UseFormRegister<T>
    name: Path<T>
}

export interface IFeeOption {
    key: 'fast' | `medium-${number}` | 'medium' | 'slow'
    fee: string
    note: string
    description?: string
}

interface IProps {
    XCH: IAsset
    fee: string
    fees: IFeeOption[]
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

const FeesRadio = <T extends FieldValues>({
    XCH,
    fee,
    fees,
    register,
    name,
}: IProps & IReactHookFormProps<T>) => {
    return (
        <div className="gap-2 flex flex-col">
            {fees.map((item) => (
                <label
                    key={item.note}
                    htmlFor={item.note}
                    className={classNames(
                        'flex flex-col gap-1 p-3 ring-1 rounded-lg bg-white/5 hover:ring-primary shrink cursor-pointer text-subtitle1',
                        fee === item.fee ? 'ring-primary' : 'ring-primary/30'
                    )}
                >
                    <span className="font-semibold whitespace-nowrap">
                        {item.fee} {XCH.code}
                    </span>
                    <div className="flex-row-center gap-1">
                        <span className="capitalize text-body3 text-primary-100">
                            {item.note}
                        </span>
                        {item.description && (
                            <>
                                <a
                                    data-tooltip-id={`fee-option-${item.key}`}
                                    data-data-tooltip-place="top"
                                    data-tooltip-content={item.description}
                                >
                                    <InfoIcon className="w-3 h-3 text-active" />
                                </a>
                                <Tooltip
                                    id={`fee-option-${item.key}`}
                                    className="custom-tooltips"
                                />
                            </>
                        )}
                    </div>
                    <input
                        type="radio"
                        id={item.note}
                        value={item.fee}
                        checked={fee === item.fee}
                        className="sr-only"
                        {...register(name)}
                    />
                </label>
            ))}
        </div>
    )
}

export default FeesRadio
