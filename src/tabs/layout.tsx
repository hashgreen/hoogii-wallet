import { PropsWithChildren, ReactNode, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router-dom'

import BackLink from '~/layouts/BackLink'

const Layout = () => {
    return (
        <div className="container max-w-screen-extension mx-auto px-0">
            <Outlet />
        </div>
    )
}

export const Header = () => {
    const { t } = useTranslation()
    return (
        <nav className="flex-row-center h-[70px] gap-2 capitalize text-headline3">
            <img src="/images/logo.svg" className="w-10" />
            {t('hoogii')}
        </nav>
    )
}

interface INext {
    text: string
    to?: string
    onClick?: () => void
}

interface IProps {
    title?: ReactNode
    description?: ReactNode
    next?: INext
    back?: boolean
}

export const SubLayout = ({
    title,
    description,
    next,
    back = true,
    children,
}: PropsWithChildren<IProps>) => {
    const { t } = useTranslation()
    const nextRef = useRef(null)

    useEffect(() => {
        if (next?.to && nextRef.current) {
            const target = nextRef.current as HTMLElement
            target.focus()
        }
    }, [next?.to])
    return (
        <>
            <Header />
            {title && (
                <div className="text-headline1 mt-4 2xl:mt-[64px]">{title}</div>
            )}
            {description && <div className="mt-5">{description}</div>}
            {children}
            {(back || next?.text) && (
                <>
                    <div className="grow"></div>
                    <div className="flex gap-4 mb-8 child:flex-1 child:max-w-[50%] mt-10">
                        {back && (
                            <BackLink className="btn btn-CTA_landing btn-outline btn-large">
                                {t('btn-back')}
                            </BackLink>
                        )}
                        {next?.text &&
                            (next?.to ? (
                                <Link
                                    ref={nextRef}
                                    to={next.to}
                                    onClick={next.onClick}
                                    className="btn btn-CTA_landing btn-large"
                                >
                                    {next.text}
                                </Link>
                            ) : (
                                <button
                                    ref={nextRef}
                                    onClick={next.onClick}
                                    className="btn btn-CTA_landing btn-large"
                                    disabled={!next.onClick}
                                >
                                    {next.text}
                                </button>
                            ))}
                    </div>
                </>
            )}
        </>
    )
}

export default Layout
