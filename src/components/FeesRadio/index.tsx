import classNames from 'classnames'
import { FieldValues, Path, UseFormRegister } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'react-tooltip'

import { IAsset } from '~/db'
import InfoIcon from '~icons/hoogii/info.jsx'

import { IFeeOption } from './utils'

interface IReactHookFormProps<T extends FieldValues> {
    register: UseFormRegister<T>
    name: Path<T>
}

interface IProps {
    XCH: IAsset
    fee: string
    fees: IFeeOption[]
    isLoading?: boolean
}

const FeesRadio = <T extends FieldValues>({
    XCH,
    fee,
    fees,
    register,
    name,
    isLoading = false,
}: IProps & IReactHookFormProps<T>) => {
    const { i18n } = useTranslation()
    return (
        <div className="gap-2 flex flex-col overflow-auto p-px">
            {fees.map((item) => (
                <label
                    key={item.note}
                    htmlFor={item.note}
                    className={classNames(
                        'fee-option',
                        fee === item.key && 'fee-option-active',
                        isLoading && 'fee-option-disabled animate-pulse'
                    )}
                >
                    {!isLoading ? (
                        <span className="font-semibold whitespace-nowrap">
                            {item.fee.toLocaleString(i18n.language, {
                                maximumFractionDigits: 12,
                            })}{' '}
                            {XCH.code}
                        </span>
                    ) : (
                        <div className="h-3 w-[100px] skeleton my-[3.5px]"></div>
                    )}
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
                        value={item.key}
                        checked={fee === item.key}
                        className="sr-only"
                        {...register(name)}
                        disabled={isLoading}
                    />
                </label>
            ))}
        </div>
    )
}

export default FeesRadio

export * from './utils'
