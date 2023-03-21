import { PropsWithChildren } from 'react'

type Pos = 'top' | 'bottom' | 'auto'

interface IProps {
    id: string
    pos?: Pos
    show?: boolean
    gap?: number
}

interface IArrow {
    x: number
    pos?: Pos
}

function Arrow({ x, pos = 'top' }: IArrow) {
    return (
        <div
            style={{ marginLeft: (x || 0) - 20 }}
            className={`h-[12px] w-[12px] bg-primary-100 rotate-45 ${
                pos === 'top' ? '-translate-y-[9px]' : 'translate-y-[9px]'
            }`}
        ></div>
    )
}

function Tooltip({
    id,
    pos = 'top',
    show = false,
    gap = 4,
    children,
}: PropsWithChildren<IProps>) {
    const el = document.getElementById(id)?.getBoundingClientRect()

    const selfHeight =
        document.getElementById('tooltip-' + id)?.getBoundingClientRect()
            .height || 0

    const top = ((el?.y || 0) - selfHeight - 3 + gap) | 0

    // TODO - auto position depending on scroll position
    // TODO - before 1/2 will be bottom
    // TODO - after 1/2 will be top
    return el ? (
        <div
            id={'tooltip-' + id}
            style={{
                top: pos === 'top' ? top : top + el.height + selfHeight,
                visibility: show ? 'visible' : 'hidden',
            }}
            className={'w-[400px] px-5 absolute z-[1000] left-0 '}
        >
            {pos === 'bottom' && <Arrow x={el?.x || 0} pos="bottom" />}
            <div
                className="w-full px-6 py-4 rounded-lg bg-primary-100 "
                id={'tooltip-content-' + id}
            >
                {children}
            </div>
            {pos === 'top' && <Arrow x={el?.x || 0} pos="top" />}
        </div>
    ) : null
}

export default Tooltip
