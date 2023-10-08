import classNames from 'classnames'
import { HTMLProps, PropsWithChildren, ReactNode } from 'react'

import ConnectSiteInfo from '~/popup/components/connectSiteInfo'
import { IPopupPageProps } from '~/popup/types'
import { MethodEnum } from '~/types/extension'

interface IAction
    extends PropsWithChildren<Omit<HTMLProps<HTMLButtonElement>, 'type'>> {
    type?: 'submit'
}

interface IProps {
    title: ReactNode
    description?: ReactNode
    actions?: IAction[]
    className?: string
}

const PopupLayout = ({
    title,
    description,
    request,
    controller,
    children,
    actions = [],
    className,
}: PropsWithChildren<
    IProps & Partial<IPopupPageProps<MethodEnum.REQUEST | MethodEnum.ENABLE>>
>) => {
    return (
        <div className="container flex flex-col w-full h-full pt-8 pb-10 mx-auto">
            {/* // * popup title */}
            <div className="flex flex-col items-center gap-5 text-dark-scale-100">
                {request && controller && (
                    <ConnectSiteInfo
                        request={request}
                        controller={controller}
                    />
                )}
                <div className="text-headline2">{title}</div>
                {description && <div className="text-body1">{description}</div>}
            </div>
            {/* // * popup content */}
            <div className={classNames('flex flex-col gap-4 grow', className)}>
                {children}
            </div>
            {/* // * popup actions */}
            <div className="flex gap-4 justify-center">
                {actions.map(({ children, ...rest }, index) => (
                    <button
                        key={index}
                        className="btn btn-CTA_landing btn-large odd:btn-outline flex-1 max-w-[50%]"
                        {...rest}
                    >
                        {children}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default PopupLayout
