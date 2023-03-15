import classNames from 'classnames'
import { useEffect, useState } from 'react'
import DetectableOverflow from 'react-detectable-overflow'
import { Tooltip } from 'react-tooltip'

import { sendMeasurement } from '~/api/ga'
import { ActionEnum, CategoryEnum, EventEnum } from '~/types/ga'
import InfoIcon from '~icons/hoogii/info.jsx'
interface IMemoDisplay {
    gaCategory?: CategoryEnum
    id: string
    memo: string
}
const MemoDisplay = ({ id, memo, gaCategory }: IMemoDisplay) => {
    const [overflow, setOverflow] = useState(false)
    const [onHover, setOnHover] = useState(false)

    const handleOnHover = (): ReturnType<typeof setTimeout> =>
        // while hover over half seconds, send a measurement
        setTimeout(() => {
            // ga events
            switch (gaCategory) {
                case CategoryEnum.ACTIVITY:
                    sendMeasurement({
                        // client_id: puzzleHash,
                        events: [
                            {
                                name: EventEnum.EXPAND_MEMO,
                                params: {
                                    category: CategoryEnum.ACTIVITY,
                                    action: ActionEnum.MOUSE,
                                },
                            },
                        ],
                    })
                    break
                default:
                    break
            }
        }, 500)

    useEffect(() => {
        if (onHover) {
            const timerId = handleOnHover()

            return () => clearTimeout(timerId)
        }
    }, [onHover])
    return (
        <div className="flex items-center">
            <DetectableOverflow onChange={setOverflow} className="flex-1">
                {memo}
            </DetectableOverflow>
            <a
                onMouseEnter={() => setOnHover(true)}
                onMouseLeave={() => setOnHover(false)}
                data-tooltip-id={id}
                // data-tooltip-content={memo}
                data-tooltip-place="top"
                className={classNames('w-4', overflow ? '' : 'hidden')}
                data-tooltip-html={`<span class="custom-tooltips-content">${memo}</span>`}
            >
                <InfoIcon className="w-3 h-3 text-active" />
            </a>
            {/* TODO  refactor use tailwind here */}
            <Tooltip id={id} className="custom-tooltips" />
        </div>
    )
}

export default MemoDisplay
