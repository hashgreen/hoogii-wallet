import classNames from 'classnames'
import { useState } from 'react'
import DetectableOverflow from 'react-detectable-overflow'
import { Tooltip } from 'react-tooltip'

import InfoIcon from '~icons/hoogii/info.jsx'
interface IMemoDisplay {
    id: string
    memo: string
}

const MemoDisplay = ({ id, memo }: IMemoDisplay) => {
    const [overflow, setOverflow] = useState(false)

    return (
        <div className="flex items-center">
            <DetectableOverflow onChange={setOverflow} className="flex-1">
                {memo}
            </DetectableOverflow>
            <a
                data-tooltip-id={id}
                data-tooltip-content={memo}
                data-tooltip-place="top"
                className={classNames('w-4', overflow ? '' : 'hidden')}
            >
                <InfoIcon className="w-3 h-3 text-active" />
            </a>

            <Tooltip
                id={id}
                className="bg-primary-100 w-[380px] break-words text-black rounded-lg z-50 absolute text-sm p-1"
            />
        </div>
    )
}

export default MemoDisplay
