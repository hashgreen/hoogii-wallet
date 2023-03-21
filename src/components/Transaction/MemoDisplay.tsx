import classNames from 'classnames'
import { t } from 'i18next'
import { useEffect, useState } from 'react'
import DetectableOverflow from 'react-detectable-overflow'

// import { Tooltip } from 'react-tooltip'
import { sendMeasurement } from '~/api/ga'
import { CategoryEnum } from '~/types/ga'
import InfoIcon from '~icons/hoogii/info.jsx'

import Tooltip from '../Tooltip'
interface IMemoDisplay {
    gaCategory?: keyof typeof CategoryEnum
    id: string
    memo: string
}
const MemoDisplay = ({ id, memo, gaCategory }: IMemoDisplay) => {
    const [overflow, setOverflow] = useState(false)
    const [onHover, setOnHover] = useState(false)
    const [content, setContent] = useState(memo)
    const [onActive, setOnActive] = useState(false)

    const handleGaEvent = () => {
        switch (gaCategory) {
            case 'activity':
                sendMeasurement({
                    events: [
                        {
                            name: 'expand_memo',
                            params: {
                                category: 'activity',
                                action: 'mouse',
                            },
                        },
                    ],
                })
                break
            default:
                break
        }
    }

    const handleOnHover = (): ReturnType<typeof setTimeout> =>
        // while hover over half seconds, send a measurement
        setTimeout(() => {
            handleGaEvent()
        }, 500)

    useEffect(() => {
        if (onHover) {
            const timerId = handleOnHover()

            return () => clearTimeout(timerId)
        }
    }, [onHover])

    const handleOnCopy = async (memo: string) => {
        setOnActive((prev) => !prev)
        if (onActive) {
            await navigator.clipboard.writeText(memo)
            setContent(t('copy'))
            setTimeout(() => setContent(memo), 500)
        }
    }

    const handleOnScroll = () => {
        setOnHover(false)
        setOnActive(false)
    }
    useEffect(() => {
        window.addEventListener('wheel', () => handleOnScroll())

        return () => {
            window.removeEventListener('wheel', () => handleOnScroll())
        }
    }, [])

    return (
        <div className="flex items-center">
            <DetectableOverflow onChange={setOverflow} className="flex-1">
                {memo}
            </DetectableOverflow>
            {/* <a
                onMouseEnter={() => setOnHover(true)}
                onMouseLeave={() => setOnHover(false)}
                data-tooltip-id={id}
                // data-tooltip-content={memo}
                data-tooltip-place="top"
                className={classNames('w-4', overflow ? '' : 'hidden')}
                data-tooltip-html={`<span class="custom-tooltips-content">${memo}</span>`}
            > */}
            <InfoIcon
                className={`w-3 h-3 cursor-pointer ${
                    (onHover || onActive) && 'text-active'
                }`}
                id={id}
                onMouseEnter={() => setOnHover(true)}
                onMouseLeave={() => setOnHover(false)}
                onClick={() => handleOnCopy(memo)}
            />
            {/* </a> */}
            {/* TODO  refactor use tailwind here */}
            {/* <Tooltip id={id} className="custom-tooltips" /> */}
            <Tooltip id={id} show={onHover || onActive}>
                <span className="custom-tooltips-content">{content}</span>
            </Tooltip>
        </div>
    )
}

export default MemoDisplay
