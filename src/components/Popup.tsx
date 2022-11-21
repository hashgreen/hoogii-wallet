import classNames from 'classnames'
import { PropsWithChildren, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface IProps {
    actionButton?: ReactNode
    close?: () => void
    className?: string
}

const Popup = ({
    close,
    actionButton,
    className,
    children,
}: PropsWithChildren<IProps>) => {
    const { t } = useTranslation()
    return (
        <div className="fixed inset-0 z-50 px-5 py-auto flex-center">
            <div
                className={classNames(
                    'flex flex-col bg-popup !h-min',
                    className
                )}
            >
                <div
                    className="-z-10 absolute-full bg-overlay"
                    onClick={close}
                ></div>
                <div className="flex flex-col gap-10 px-5 pb-14 pt-7">
                    {children}
                </div>
                <div className="gap-4 flex-center pb-7">
                    <button className="btn btn-secondary" onClick={close}>
                        {t('btn-cancel')}
                    </button>
                    {actionButton}
                </div>
            </div>
        </div>
    )
}

export const ErrorPopup = ({
    title,
    description,
    className,
    ...rest
}: IProps & { title: string; description: string }) => (
    <Popup {...rest} className={classNames('w-full', className)}>
        <div className="text-center flex-col-center">
            <img
                src="/images/popup-error.png"
                alt="mnemonic-error"
                className="w-10 h-10 mb-1"
            />
            <div className="mb-4 text-headline3 text-error">{title}</div>
            <div className="text-body2 text-primary-100">{description}</div>
        </div>
    </Popup>
)

export default Popup
