import classNames from 'classnames'
import { PropsWithChildren } from 'react'

interface IProps {
    className?: string
}

const Loading = ({ className, children }: PropsWithChildren<IProps>) => (
    <div className={classNames('flex-center full', className)}>
        <div className="flex-col gap-1 flex-center text-body1 text-primary-100">
            <div className="w-[60px] h-[60px] loading"></div>
            {children}
        </div>
    </div>
)

export default Loading
