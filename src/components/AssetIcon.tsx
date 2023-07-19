import classNames from 'classnames'
import { HTMLProps } from 'react'
interface IProps {
    assetId: string
    className?: string
}

const AssetIcon = ({
    assetId,
    src,
    className = 'w-6 h-6',
    ...rest
}: IProps & Omit<HTMLProps<HTMLImageElement>, 'crossOrigin'>) => (
    <img
        src={assetId === '' ? '/chia.png' : src || '/images/token.svg'}
        {...rest}
        className={classNames('rounded-full', className)}
        onError={({ currentTarget }) => {
            currentTarget.onerror = null
            currentTarget.src = '/images/token.svg'
        }}
    />
)

export default AssetIcon
