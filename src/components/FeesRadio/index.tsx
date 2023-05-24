import classNames from 'classnames'
import { FieldValues, Path, UseFormRegister } from 'react-hook-form'
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
    return (
        <div className="gap-2 flex flex-col">
            {fees.map((item) => (
                <label
                    key={item.note}
                    htmlFor={item.note}
                    className={classNames(
                        'flex flex-col gap-1 p-3 ring-1 rounded-lg bg-white/5 hover:ring-primary cursor-pointer text-subtitle1',
                        fee === item.fee ? 'ring-primary' : 'ring-primary/30'
                    )}
                >
                    {!isLoading ? (
                        <span className="font-semibold whitespace-nowrap">
                            {item.fee} {XCH.code}
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

export * from './utils'
