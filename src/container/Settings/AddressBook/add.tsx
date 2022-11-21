import { joiResolver } from '@hookform/resolvers/joi'
import classNames from 'classnames'
import joi from 'joi'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import ErrorMessage from '~/components/ErrorMessage'
import { db } from '~/db'
import BackLink from '~/layouts/BackLink'
import { useClosablePage } from '~/layouts/ClosablePage'
import rootStore from '~/store'
import Validation from '~/utils/validation'

export interface IForm {
    name: string
    address: string
}

const AddAddressBook = () => {
    const { t } = useTranslation()
    useClosablePage(t('setting-address_book-add-title'))
    const navigate = useNavigate()

    const {
        walletStore: { addresses, chain },
    } = rootStore

    const schema = joi.object({
        name: joi.string().required().max(15).messages({
            'string.empty': 'error-required',
            'string.max': 'error-over-max-length',
        }),
        address: Validation.address(chain?.prefix, addresses),
    })

    const {
        register,
        handleSubmit,
        reset,
        setFocus,
        formState: { errors, isValid },
    } = useForm<IForm>({
        mode: 'onChange',
        resolver: joiResolver(schema),
        reValidateMode: 'onChange',
    })

    const onSubmit = async (data: IForm) => {
        await db.addresses.add(data)
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
            className="flex flex-col justify-between h-full"
            onSubmit={handleSubmit(onSubmit)}
        >
            <>
                <div className="flex flex-col gap-3">
                    <div>
                        <input
                            type="text"
                            className={classNames(
                                'input',
                                errors.name && 'input-error'
                            )}
                            placeholder={t('input-name-placeholder')}
                            {...register('name')}
                            // onKeyDown={(e) => {
                            //     if (e.key === 'Enter') {
                            //         e.preventDefault()
                            //         setFocus('address')
                            //     }
                            // }}
                        />
                        <ErrorMessage
                            field={{
                                key: 'name',
                                value: 'input-name-placeholder',
                            }}
                            errors={errors}
                            t={t}
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            className={classNames(
                                'input',
                                errors.address && 'input-error'
                            )}
                            placeholder={t('input-address-placeholder')}
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
                    </div>
                </div>
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
            </>
        </form>
    )
}

export default observer(AddAddressBook)
