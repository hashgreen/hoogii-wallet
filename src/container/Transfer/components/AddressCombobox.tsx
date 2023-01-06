import { Combobox } from '@headlessui/react'
import classNames from 'classnames'
import { flatten } from 'lodash-es'
import { forwardRef, HTMLProps, useCallback, useMemo, useState } from 'react'

import { IAddress } from '~/db'
import { shortenHash } from '~/utils'
import { fuseOptions, search } from '~/utils/fuse'

interface IProps {
    value?: IAddress
    onChange: (...event: any[]) => void
    addresses: { [key: string]: IAddress[] }
    hasError?: boolean
}

const AddressCombobox = forwardRef<
    HTMLInputElement,
    IProps & Omit<HTMLProps<HTMLInputElement>, 'value' | 'onChange' | 'as'>
>(({ value, onChange, addresses, hasError = false, ...rest }, ref) => {
    const [query, setQuery] = useState('')
    const options = useMemo(
        () =>
            Object.fromEntries(
                Object.entries(addresses).map(([k, v]) => [
                    k,
                    search<IAddress>(
                        query,
                        v,
                        fuseOptions(['name', 'address'])
                    ),
                ])
            ),
        [query, addresses]
    )

    const onInputChange = useCallback(
        (e) => {
            setQuery(e.target.value)
            const address = flatten(Object.values(options)).find(
                (item) =>
                    item.address === e.target.value ||
                    item.name === e.target.value
            )
            onChange(address ?? { address: e.target.value, name: '' })
        },
        [options]
    )

    return (
        <Combobox
            as="div"
            // value={value}
            onChange={onChange}
            className="relative flex flex-col"
            nullable
        >
            <Combobox.Button>
                <Combobox.Input<'input', IAddress>
                    ref={ref}
                    displayValue={(value) => value?.name || value?.address}
                    onChange={onInputChange}
                    onKeyDownCapture={({ key }) => {
                        if (
                            (key === 'Backspace' || key === 'Delete') &&
                            value?.name
                        ) {
                            onChange(null)
                            setQuery('')
                        }
                    }}
                    className={classNames('input', hasError && 'input-error')}
                    {...rest}
                />
            </Combobox.Button>
            <Combobox.Options
                className={classNames(
                    'absolute top-full mt-2 max-h-[308px] rounded bg-box border-2 border-primary overflow-auto py-3 px-2 flex flex-col gap-4 w-full z-10',
                    Object.values(options).some((item) => item.length)
                        ? 'block'
                        : 'hidden'
                )}
            >
                {query.length > 0 && (
                    <Combobox.Option
                        value={{ address: query, name: '' }}
                        className="sr-only"
                    >
                        {query}
                    </Combobox.Option>
                )}
                {Object.entries(options).map(([title, subitems], index) =>
                    subitems.length ? (
                        <div
                            key={`title_${index}`}
                            className="flex flex-col gap-2"
                        >
                            <div className="pl-2 capitalize text-body3 text-primary-100">
                                {title}
                            </div>
                            {subitems.map((item, index) => (
                                <Combobox.Option
                                    key={`item.address_${index}`}
                                    value={item}
                                    className={({ active }) =>
                                        classNames(
                                            'justify-between flex-row-center h-8 rounded px-2 text-body3 cursor-pointer',
                                            active ||
                                                item.address === value?.address
                                                ? 'bg-white/20'
                                                : 'bg-white/5'
                                        )
                                    }
                                >
                                    <span>{shortenHash(item.address)}</span>
                                    <span className="text-primary-100">
                                        {item.name}
                                    </span>
                                </Combobox.Option>
                            ))}
                        </div>
                    ) : null
                )}
            </Combobox.Options>
        </Combobox>
    )
})
AddressCombobox.displayName = 'AddressCombobox'
export default AddressCombobox
