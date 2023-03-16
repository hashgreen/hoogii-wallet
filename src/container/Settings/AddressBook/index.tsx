import { groupBy, sortBy } from 'lodash-es'
import { observer } from 'mobx-react-lite'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { sendMeasurement } from '~/api/ga'
import { AddressBookItem } from '~/components/Item'
import SearchBar from '~/components/SearchBar'
import { IAddress } from '~/db'
import { useClosablePage } from '~/layouts/ClosablePage'
import rootStore from '~/store'
import { ActionEnum, CategoryEnum, EventEnum } from '~/types/ga'
import { fuseOptions, search } from '~/utils/fuse'

export interface IForm {
    name: string
    address: string
}

const AddressBook = () => {
    const { t } = useTranslation()
    useClosablePage(t('setting-address_book'))

    const {
        walletStore: { addresses },
    } = rootStore

    const [query, setQuery] = useState('')
    const filteredAddresses = useMemo(
        () =>
            search<IAddress>(
                query,
                addresses,
                fuseOptions(['address', 'name'])
            ),
        [query, addresses]
    )
    const grouped = useMemo(
        () => groupBy(filteredAddresses, (e) => e.name?.[0] ?? ''),
        [filteredAddresses]
    )

    return (
        <>
            {addresses.length > 0 && (
                <div className="flex justify-end mb-3">
                    <Link to="add" className="btn btn-primary btn-outline">
                        {t('btn-add_address')}
                    </Link>
                </div>
            )}
            {/* TODO: add fuzzy search */}
            <SearchBar
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
                placeholder={t('search-address_book-placeholder')}
            />
            <div className="flex flex-col mt-5 gap-[25px] overflow-auto">
                {sortBy(Object.keys(grouped)).map((group) => (
                    <div key={group} className="flex flex-col gap-1">
                        <span className="text-center uppercase text-subtitle1 text-primary-100">
                            {group}
                        </span>
                        <div className="flex flex-col gap-2">
                            {sortBy(grouped[group], (e) => [
                                e.name,
                                e.address,
                            ]).map((item) => (
                                <AddressBookItem
                                    key={item.address}
                                    id={item.id?.toString()}
                                    name={item.name}
                                    address={item.address}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            {!addresses.length && (
                <div className="gap-3 flex-col-center fixed-center text-body1 text-primary-100 whitespace-nowrap">
                    {t('setting-address_book-description')}
                    <Link
                        to="add"
                        onClick={() =>
                            sendMeasurement({
                                events: [
                                    {
                                        name: EventEnum.ADD_ADDRESS_BOOK,
                                        params: {
                                            category: CategoryEnum.SETTING,
                                            action: ActionEnum.CLICK,
                                        },
                                    },
                                ],
                            })
                        }
                        className="btn btn-primary btn-outline"
                    >
                        {t('btn-add_address')}
                    </Link>
                </div>
            )}
        </>
    )
}

export default observer(AddressBook)
