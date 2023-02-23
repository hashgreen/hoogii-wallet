import classNames from 'classnames'
import { useState } from 'react'
import DetectableOverflow from 'react-detectable-overflow'

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
        </div>
    )
}

export default MemoDisplay
