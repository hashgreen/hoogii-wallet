import classNames from 'classnames'
import { PropsWithChildren, useState } from 'react'

import { sendMeasurement } from '~/api/ga'
import { ActionEnum, CategoryEnum, EventEnum } from '~/types/ga'
interface IProps {
    gaCategory?: CategoryEnum
    dataTip: string
    copiedDataTip: string
    value: string
    duration?: number
    className?: string
}

const CopyTooltip = ({
    gaCategory,
    dataTip,
    copiedDataTip,
    value,
    duration = 300,
    className,
    children,
}: PropsWithChildren<IProps>) => {
    const [_dataTip, setDataTip] = useState(dataTip)

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value)
            // ga events
            switch (gaCategory) {
                case CategoryEnum.MAIN_PAGE:
                    sendMeasurement({
                        events: [
                            {
                                name: EventEnum.COPY_ADDRESS,
                                params: {
                                    category: CategoryEnum.MAIN_PAGE,
                                    action: ActionEnum.CLICK,
                                },
                            },
                        ],
                    })
                    break
                case CategoryEnum.ACTIVITY:
                    sendMeasurement({
                        events: [
                            {
                                name: EventEnum.COPY_ADDRESS_FROM_SENDER,
                                params: {
                                    category: CategoryEnum.ACTIVITY,
                                    action: ActionEnum.CLICK,
                                },
                            },
                        ],
                    })
                    break
                default:
                    break
            }

            setDataTip(copiedDataTip)

            setTimeout(() => setDataTip(dataTip), duration)
        } catch (error) {}
    }

    return (
        <div
            className={classNames('tooltip', className)}
            onClick={copy}
            data-tip={_dataTip}
        >
            {children}
        </div>
    )
}

export default CopyTooltip
