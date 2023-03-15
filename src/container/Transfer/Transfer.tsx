import { joiResolver } from '@hookform/resolvers/joi'
import Decimal from 'decimal.js-light'
import * as joi from 'joi'
import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { sendMeasurement } from '~/api/ga'
import ErrorMessage from '~/components/ErrorMessage'
import { IAddress, IAsset } from '~/db'
import BackLink from '~/layouts/BackLink'
import { useClosablePage } from '~/layouts/ClosablePage'
import rootStore from '~/store'
import { ActionEnum, CategoryEnum, EventEnum } from '~/types/ga'
import Validation from '~/utils/validation'

import AddressCombobox from './components/AddressCombobox'
import AssetCombobox from './components/AssetCombobox'
import TransferPopup from './TransferPopup'

export interface IForm {
    address: IAddress
    asset: IAsset
    amount: string
    memo: string
}

const Transfer = () => {
    const { t } = useTranslation()
    useClosablePage(t('send-title'))
    const [open, setOpen] = useState(false)

    const {
        walletStore: { addresses, chain },
        assetsStore: { assets, XCH },
        historyStore: { recentAddress },
    } = rootStore

    const schema = joi.object({
        address: joi
            .object({
                address: Validation.address(chain?.prefix),
            })
            .unknown()
            .required(),
        asset: joi.object().required(),
        amount: joi.string().required(),
        memo: joi.string().allow(''),
    })
    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        setFocus,
        formState: { errors, isValid },
    } = useForm<IForm>({
        mode: 'onChange',
        reValidateMode: 'onChange',
        resolver: joiResolver(schema),
    })
    const address = watch('address')
    const asset = watch('asset')
    const amount = watch('amount')
    const memo = watch('memo')

    useEffect(() => {
        setFocus('address')
    }, [])

    const onSubmit = async () => {
        if (memo.length > 0) {
            sendMeasurement({
                events: [
                    {
                        name: EventEnum.MEMO,
                        params: {
                            category: CategoryEnum.SEND,
                            action: ActionEnum.FILL,
                        },
                    },
                ],
            })
        }

        sendMeasurement({
            events: [
                {
                    name: EventEnum.SEND,
                    params: {
                        category: CategoryEnum.SEND,
                        action: ActionEnum.CLICK,
                    },
                },
            ],
        })

        setOpen(true)
    }

    const onKeyDown = (event, nextField: keyof IForm) => {
        if (event.key.toLowerCase() === 'enter') {
            setFocus(nextField)
        }
    }

    return (
        <>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col justify-between grow"
            >
                <div>
                    <div className="mb-3">
                        <Controller
                            control={control}
                            name="address"
                            render={({ field }) => (
                                <AddressCombobox
                                    {...field}
                                    autoComplete="off"
                                    addresses={{
                                        [t(
                                            'combobox-address-option-recent_addresses'
                                        )]: recentAddress
                                            ? [
                                                  {
                                                      name: '',
                                                      address: recentAddress,
                                                  },
                                              ]
                                            : [],
                                        [t(
                                            'combobox-address-option-address_book'
                                        )]: addresses,
                                    }}
                                    hasError={Boolean(errors?.address)}
                                    placeholder={t(
                                        'combobox-address-placeholder'
                                    )}
                                    onKeyDown={(e) => onKeyDown(e, 'asset')}
                                />
                            )}
                        />
                        <ErrorMessage
                            field={{
                                key: 'address',
                                value: 'input-address-placeholder',
                            }}
                            errors={errors.address ?? {}}
                            t={t}
                        />
                    </div>
                    <div className="flex gap-3">
                        <Controller
                            control={control}
                            name="asset"
                            render={({ field }) => (
                                <AssetCombobox
                                    {...field}
                                    assets={assets}
                                    placeholder={t('asset')}
                                    onKeyDownCapture={(e) =>
                                        onKeyDown(e, 'amount')
                                    }
                                />
                            )}
                        />
                        <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            className="input"
                            disabled={!asset}
                            placeholder={t('input-send-amount-placeholder')}
                            {...register('amount', {
                                onChange: (e) => {
                                    const fixed =
                                        asset.assetId === XCH.assetId ? 12 : 3
                                    const value = new Decimal(e.target.value)

                                    setValue(
                                        'amount',
                                        !isNaN(Number(e.target.value))
                                            ? Number(e.target.value) === 0 ||
                                              value.decimalPlaces() < fixed
                                                ? e.target.value
                                                : value.toFixed(fixed)
                                            : amount
                                    )
                                },
                            })}
                        />
                        {/* Decimal */}
                    </div>
                    <hr className="w-full h-px my-5 border-primary/30 " />
                    <input
                        type="text"
                        inputMode="text"
                        autoComplete="off"
                        className="input"
                        disabled={!asset}
                        placeholder={t('input-send-memo-placeholder')}
                        {...register('memo', {
                            onChange: (e) => {
                                setValue('memo', e.target.value)
                            },
                        })}
                    />
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
                        {t('btn-send')}
                    </button>
                </div>
            </form>
            {open && (
                <TransferPopup
                    address={address}
                    asset={asset}
                    amount={amount}
                    memo={memo}
                    close={() => setOpen(false)}
                />
            )}
        </>
    )
}

export default observer(Transfer)
