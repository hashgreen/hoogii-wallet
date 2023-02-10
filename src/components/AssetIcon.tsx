import classNames from 'classnames'
import { HTMLProps } from 'react'
interface IProps {
    assetId: string
    className?: string
}

const AssetIcon = ({
    assetId,
    src,
    className = '',
    ...rest
}: IProps & Omit<HTMLProps<HTMLImageElement>, 'crossOrigin'>) => (
    <img
        src={assetId === 'XCH' ? '/chia.png' : src || '/images/token.svg'}
        {...rest}
        className={classNames('rounded-full w-6 h-6', className)}
        onError={({ currentTarget }) => {
            currentTarget.onerror = null
            currentTarget.src = '/images/token.svg'
        }}
    />
)

export default AssetIcon
