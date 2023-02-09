import { PropsWithChildren, ReactNode, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import BackLink from './BackLink'

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

const PublicRouteLayout = ({
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
        <div className="relative flex flex-col items-center px-10 bg-contain full bg-landing">
            <img src="/images/logo.svg" className="absolute w-10 top-5" />
            {title && (
                <>
                    <div className="text-center text-headline2 mt-[68px]">
                        {title}
                    </div>
                    {description && (
                        <div className="mt-3 text-center text-body1 text-primary-100">
                            {description}
                        </div>
                    )}
                </>
            )}
            {children}
            {(back || next?.text) && (
                <>
                    <div className="grow"></div>
                    <div className="flex justify-center w-full gap-4 mb-8 child:flex-1 child:max-w-[50%]">
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
        </div>
    )
}

export default PublicRouteLayout
