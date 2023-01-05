import classNames from 'classnames'
import {
    ComponentProps,
    createElement,
    PropsWithChildren,
    ReactNode,
} from 'react'
import { Link } from 'react-router-dom'

import { IAsset } from '~/db'
import { shortenHash } from '~/utils'
import CancelIcon from '~icons/hoogii/cancel.jsx'
import CopyIcon from '~icons/hoogii/copy.jsx'
import OpenPageIcon from '~icons/hoogii/open-page.jsx'

import AssetIcon from './AssetIcon'

type Props<TTag extends keyof JSX.IntrinsicElements> = Omit<
    PropsWithChildren<
        {
            as?: keyof JSX.IntrinsicElements
            active?: boolean
            disabled?: boolean
            className?: string
        } & JSX.IntrinsicElements[TTag]
    >,
    'ref'
>

function Item<TTag extends keyof JSX.IntrinsicElements>({
    as = 'button',
    active = false,
    className,
    children,
    ...rest
}: Props<TTag>) {
    return createElement(
        as,
        {
            className: classNames(
                'relative h-[72px] justify-between p-4 rounded-lg flex-row-center box-border bg-white/5',
                className,
                active ? 'border-2 border-primary' : 'border border-primary/30',
                rest.disabled
                    ? 'bg-disable cursor-not-allowed'
                    : 'hover:border-primary'
            ),
            ...rest,
        },
        children
    )
}

export default Item

interface IAssetItemProps {
    asset: IAsset
    balance?: () => string | ReactNode
}

export const AssetItem = ({
    asset,
    balance,
    ...rest
}: IAssetItemProps & ComponentProps<typeof Item>) => {
    return (
        <Item {...rest} className="!px-3">
            <span className="gap-3 font-bold flex-row-center">
                <AssetIcon
                    assetId={asset.assetId}
                    src={asset.iconUrl}
                    alt={asset.code}
                    className="w-7 aspect-square border-[6px] border-secondary rounded-full drop-shadow-asset-logo box-content"
                />
                {asset.code}
            </span>
            {typeof balance === 'function' ? balance() : balance}
        </Item>
    )
}

export const LoadingAssetItem = () => {
    return (
        <Item className="!px-3 pointer-events-none">
            <span className="gap-3 font-bold flex-row-center">
                <div className="skeleton rounded-full w-10 aspect-square"></div>
                <div className="skeleton skeleton-text w-[120px]"></div>
            </span>
            <div className="skeleton skeleton-text w-[60px]"></div>
        </Item>
    )
}

interface IAddressBookItemProps {
    id?: string
    name?: string
    address: string
}

export const AddressBookItem = ({
    name,
    address,
    id,
    ...rest
}: IAddressBookItemProps & ComponentProps<typeof Item<'div'>>) => (
    <Link to={`detail/${id}`}>
        <Item as="div" {...rest}>
            <div>
                {name && <div className="mb-1 text-subtitle1">{name}</div>}
                <div className="text-body3 text-primary-100">
                    {shortenHash(address)}
                </div>
            </div>
            <button
                onClick={(e) => {
                    e.preventDefault()
                    navigator.clipboard.writeText(address)
                }}
            >
                <CopyIcon className="w-3 h-3 text-active" />
            </button>
        </Item>
    </Link>
)

interface IConnectedSiteItemProps {
    name: string
    iconUrl?: string
    action?: () => void
}

export const ConnectedSiteItem = ({
    name,
    iconUrl,
    action,
    ...rest
}: IConnectedSiteItemProps & ComponentProps<typeof Item<'a'>>) => (
    <Item as="a" key={name} {...rest} className="!cursor-pointer">
        <span className="gap-2 flex-row-center">
            <img
                src={iconUrl}
                alt={`${name} icon`}
                className="w-6 h-6 rounded-full"
            />
            {name}
        </span>
        <button onClick={action}>
            {rest.disabled ? (
                <OpenPageIcon className="w-3 h-3 text-active" />
            ) : (
                <CancelIcon className="w-3 h-3 text-active" />
            )}
        </button>
    </Item>
)
