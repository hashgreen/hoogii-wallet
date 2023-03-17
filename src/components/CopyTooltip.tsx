import classNames from 'classnames'
import { PropsWithChildren, useState } from 'react'

import { sendMeasurement } from '~/api/ga'
import { CategoryEnum } from '~/types/ga'
interface IProps {
    gaCategory?: keyof typeof CategoryEnum
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
                case 'main_page':
                    sendMeasurement({
                        events: [
                            {
                                name: 'copy_address',
                                params: {
                                    category: 'main_page',
                                    action: 'click',
                                },
                            },
                        ],
                    })
                    break
                case 'activity':
                    sendMeasurement({
                        events: [
                            {
                                name: 'copy_address_from_sender',
                                params: {
                                    category: 'activity',
                                    action: 'click',
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
