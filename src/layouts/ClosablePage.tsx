import {
    PropsWithChildren,
    ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react'
import { Link, Outlet, useOutletContext } from 'react-router-dom'

import BackIcon from '~icons/hoogii/back.jsx'

import Header from './Header'

interface IProps {
    title: ReactNode
    backTo?: string | number
    back?: () => void
}

const ClosablePage = ({
    title,
    backTo = -1,
    back,
    children,
}: PropsWithChildren<IProps>) => (
    <div className="container flex flex-col pt-3 pb-8 overflow-hidden full">
        <div className="relative text-center font-semibold text-[28px] capitalize">
            {title}
            <Link
                to={backTo as any}
                onClick={back}
                className="absolute left-0 -translate-y-1/2 top-1/2"
            >
                <BackIcon className="w-5 h-5" />
            </Link>
        </div>
        <div className="flex flex-col overflow-hidden pt-7 grow">
            {children}
        </div>
    </div>
)

interface IOutletContext {
    setTitle: (title: ReactNode) => void
    setBackTo: (backTo: string | number) => void
}

const ClosablePageLayout = () => {
    const [title, setTitle] = useState<ReactNode>('')
    const [backTo, setBackTo] = useState<string | number>(-1)

    return (
        <div className="flex flex-col h-full bg-main">
            <Header className="sticky left-0 right-0" />
            <ClosablePage title={title} backTo={backTo}>
                <Outlet context={{ setTitle, setBackTo }} />
            </ClosablePage>
        </div>
    )
}

export const useClosablePage = (
    title: ReactNode,
    backTo: string | number = -1
) => {
    const ref = useRef(title)
    const context = useOutletContext<IOutletContext>()

    useEffect(() => {
        context.setTitle(title)
        backTo && context.setBackTo(backTo)
    }, [ref, backTo])

    return context
}

export default ClosablePageLayout
