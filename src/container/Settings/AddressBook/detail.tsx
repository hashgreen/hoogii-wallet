import { observer } from 'mobx-react-lite'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

import { ErrorPopup } from '~/components/Popup'
import { db, IAddress } from '~/db'
import BackLink from '~/layouts/BackLink'
import { useClosablePage } from '~/layouts/ClosablePage'
import rootStore from '~/store'
import { shortenHash } from '~/utils'
import CopyIcon from '~icons/hoogii/copy.jsx'
import EditIcon from '~icons/hoogii/edit.jsx'

const Title = ({ address }: { address?: IAddress }) => (
    <div className="flex-center">
        {address?.name}
        <Link to={`setting/addressBook/detail/${address?.id}/edit`}>
            <EditIcon className="w-4 h-4 ml-2" />
        </Link>
    </div>
)

const AddressBookDetail = () => {
    const { t } = useTranslation()
    const params = useParams()
    const [open, setOpen] = useState(false)

    const {
        walletStore: { addresses },
    } = rootStore
    const address = useMemo(
        () => addresses.find((e) => e.id === Number(params.id)),
        [addresses, params.id]
    )
    const { setTitle } = useClosablePage(<Title address={address} />)

    useEffect(() => {
        setTitle(<Title address={address} />)
    }, [address?.name])

    return (
        <>
            <div className="flex flex-col h-full gap-1">
                <span className="capitalize text-body3 text-primary-100">
                    {t('setting-address_book-address_label')}
                </span>
                <div className="justify-between flex-row-center py-2.5 gap-2">
                    {address?.address && (
                        <span>{shortenHash(address.address)}</span>
                    )}
                    <button
                        onClick={() => {
                            if (address?.address) {
                                navigator.clipboard.writeText(address?.address)
                            }
                        }}
                    >
                        <CopyIcon className="w-3 h-3 text-active" />
                    </button>
                </div>
                <div className="grow"></div>
                <div className="flex justify-center">
                    <button
                        className="btn btn-error btn-outline"
                        onClick={() => setOpen(true)}
                    >
                        {t('btn-delete_address')}
                    </button>
                </div>
            </div>
            {open && (
                <ErrorPopup
                    actionButton={
                        <BackLink
                            onClick={async () => {
                                if (address?.id) {
                                    await db.addresses.delete(address?.id)
                                }
                            }}
                            className="btn btn-error w-min"
                        >
                            {t('btn-delete_address')}
                        </BackLink>
                    }
                    close={() => setOpen(false)}
                    title={t('setting-address_book-delete_popup-title', {
                        name: address?.name,
                    })}
                    description={t(
                        'setting-address_book-delete_popup-description'
                    )}
                />
            )}
        </>
    )
}

export default observer(AddressBookDetail)
