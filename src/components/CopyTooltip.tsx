import classNames from 'classnames'
import { PropsWithChildren, useState } from 'react'

import { sendMeasurement } from '~/api/ga'
import { ActionEnum, CategoryEnum, EventEnum } from '~/types/ga'

interface IProps {
    dataTip: string
    copiedDataTip: string
    value: string
    duration?: number
    className?: string
}

const CopyTooltip = ({
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

            await sendMeasurement({
                // client_id: puzzleHash,
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
