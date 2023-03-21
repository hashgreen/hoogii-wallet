import classNames from 'classnames'
import { PropsWithChildren, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import CloseIcon from '~icons/hoogii/close.jsx'

interface IProps {
    actionButton?: ReactNode
    close?: () => void
    className?: string
    childrenClassName?: string
    closeBtn?: boolean
    btnClassName?: string
    closeIconBtn?: boolean
}

const Popup = ({
    close,
    actionButton,
    className,
    children,
    childrenClassName,
    closeBtn = true,
    btnClassName,
    closeIconBtn = false,
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
                    className={classNames(
                        ' relative flex flex-col gap-10 px-5 pb-14 pt-7',
                        childrenClassName
                    )}
                >
                    {closeIconBtn && (
                        <div
                            onClick={close}
                            className="text-[#5F6881] absolute right-0"
                        >
                            <CloseIcon />
                        </div>
                    )}
                    {children}
                </div>
                <div
                    className={classNames(
                        'gap-4 flex-center pb-7',
                        btnClassName
                    )}
                >
                    {closeBtn && (
                        <button className="btn btn-secondary" onClick={close}>
                            {actionButton ? t('btn-cancel') : t('btn-close')}
                        </button>
                    )}
                    {actionButton}
                </div>
            </div>
            <div
                className="-z-10 absolute-full bg-overlay"
                onClick={close}
            ></div>
        </div>
    )
}

export const ErrorPopup = ({
    title,
    description,
    className,
    ...rest
}: IProps & { title: string; description: string }) => (
    <Popup {...rest} className={classNames('w-[400px]', className)}>
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
