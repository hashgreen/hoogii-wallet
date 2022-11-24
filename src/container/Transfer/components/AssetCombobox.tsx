import { Combobox } from '@headlessui/react'
import classNames from 'classnames'
import { forwardRef, HTMLProps, useRef } from 'react'

import AssetIcon from '~/components/AssetIcon'
import { IAsset } from '~/db'
import BottomIcon from '~icons/hoogii/bottom.jsx'
import UpIcon from '~icons/hoogii/up.jsx'

interface IProps {
    value?: IAsset
    onChange: (...event: any[]) => void
    assets: IAsset[]
}

const AssetCombobox = forwardRef<
    HTMLInputElement,
    IProps & Omit<HTMLProps<HTMLInputElement>, 'value' | 'onChange' | 'as'>
>(({ value, onChange, assets, placeholder, ...rest }, ref) => {
    const innerRef = useRef<HTMLButtonElement>(null)
    return (
        <Combobox
            as="div"
            value={value}
            onChange={onChange}
            className="relative flex flex-col"
        >
            <Combobox.Button
                ref={innerRef}
                className={({ open }) =>
                    classNames(
                        'justify-between w-32 h-10 pl-4 pr-2 text-body3 rounded flex-row-center',
                        open
                            ? 'border-primary border-2'
                            : 'border-primary/70 border'
                    )
                }
            >
                {({ open }) => (
                    <>
                        <Combobox.Input<'input', IAsset>
                            ref={ref}
                            className="sr-only"
                            onChange={(e) => {}}
                            onFocus={(e) => {
                                if (
                                    !innerRef.current?.contains(e.relatedTarget)
                                ) {
                                    innerRef.current?.click()
                                }
                            }}
                            {...rest}
                        />
                        {value ? (
                            <span className="gap-2 flex-row-center">
                                <AssetIcon
                                    assetId={value.assetId}
                                    src={value.iconUrl}
                                />
                                {value.code}
                            </span>
                        ) : (
                            <span className="capitalize">{placeholder}</span>
                        )}
                        {open ? (
                            <UpIcon className="w-3 h-3 text-active" />
                        ) : (
                            <BottomIcon className="w-3 h-3 text-active" />
                        )}
                    </>
                )}
            </Combobox.Button>
            <Combobox.Options className="absolute top-full mt-2 w-[200px] max-h-[216px] rounded bg-box border-2 border-primary overflow-auto py-3 px-2 flex flex-col gap-2">
                {assets.map((item, index) => (
                    <Combobox.Option
                        key={index}
                        value={item}
                        className={classNames(
                            'flex-row-center w-full h-8 rounded py-1 px-2 gap-2 text-body3 uppercase hover:bg-white/20 cursor-pointer',
                            item.assetId === value?.assetId
                                ? 'bg-white/20'
                                : 'bg-white/5'
                        )}
                    >
                        <AssetIcon assetId={item.assetId} src={item.iconUrl} />
                        {item.code}
                    </Combobox.Option>
                ))}
            </Combobox.Options>
        </Combobox>
    )
})
AssetCombobox.displayName = 'AssetCombobox'
export default AssetCombobox