import { joiResolver } from '@hookform/resolvers/joi'
import classNames from 'classnames'
import * as joi from 'joi'
import { observer } from 'mobx-react-lite'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'

import ErrorMessage from '~/components/ErrorMessage'
import BackLink from '~/layouts/BackLink'
import { useClosablePage } from '~/layouts/ClosablePage'
import rootStore from '~/store'
import Validation from '~/utils/validation'

import { IForm } from '.'

const EditAddressBook = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const params = useParams()

    const {
        walletStore: { addresses, chain },
    } = rootStore

    const address = useMemo(
        () => addresses.find((e) => e.id === Number(params.id)),
        [addresses, params.id]
    )
    useClosablePage(t('setting-address_book-edit-title'))

    const schema = joi
        .object({
            name: joi.string().max(15).messages({
                'string.max': 'error-over-max-length',
            }),
            address: Validation.address(chain?.prefix, addresses, false),
        })
        .min(1)

    const {
        register,
        handleSubmit,
        reset,
        setFocus,
        formState: { errors, isValid },
    } = useForm<IForm>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        resolver: joiResolver(schema),
    })
    const onSubmit = async (data: IForm) => {
        if (address?.id && (data.name || data.address)) {
            await rootStore.walletStore.db.addresses.update(address.id, {
                name: data.name || address.name,
                address: data.address || address.address,
            })
        }
        navigate(-1)
    }

    useEffect(() => {
        setFocus('name')
        return () => {
            reset()
        }
    }, [])

    return (
        <form
            className="flex flex-col gap-5 grow"
            onSubmit={handleSubmit(onSubmit)}
        >
            <label
                htmlFor="name"
                className="flex flex-col gap-1 capitalize text-body3 text-primary-100"
            >
                {t('input-name-placeholder')}
                <input
                    id="name"
                    type="text"
                    className={classNames(
                        'input',
                        errors.name && 'input-error'
                    )}
                    placeholder={address?.name ?? t('input-name-placeholder')}
                    {...register('name')}
                    // onKeyDown={(e) => {
                    //     if (e.key === 'Enter') {
                    //         e.preventDefault()
                    //         setFocus('address')
                    //     }
                    // }}
                    autoComplete="off"
                />
                <ErrorMessage
                    field={{
                        key: 'name',
                        value: 'input-name-placeholder',
                    }}
                    errors={errors}
                    t={t}
                />
            </label>
            <label
                htmlFor="address"
                className="flex flex-col gap-1 capitalize text-body3 text-primary-100"
            >
                {t('input-address-placeholder')}
                <input
                    id="address"
                    type="text"
                    className={classNames(
                        'input',
                        errors.address && 'input-error'
                    )}
                    placeholder={
                        address?.address ?? t('input-address-placeholder')
                    }
                    {...register('address')}
                />
                <ErrorMessage
                    field={{
                        key: 'address',
                        value: 'input-address-placeholder',
                    }}
                    errors={errors}
                    t={t}
                />
            </label>
            <div className="grow"></div>
            <div className="flex justify-between gap-4 child:w-full">
                <BackLink className="btn btn-secondary">
                    {t('btn-cancel')}
                </BackLink>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!isValid}
                >
                    {t('btn-save')}
                </button>
            </div>
        </form>
    )
}

export default observer(EditAddressBook)
