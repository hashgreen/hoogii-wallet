import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import AssetIcon from '~/components/AssetIcon'
import Popup, { ErrorPopup } from '~/components/Popup'
import rootStore from '~/store'
import { shortenHash } from '~/utils'
import InfoIcon from '~icons/hoogii/info.jsx'

import { IForm as IBaseForm } from './Transfer'

interface IProps {
    close: () => void
}

interface IForm {
    fee: string
}

const TransferPopup = ({
    address,
    asset,
    amount,
    memo,
    close,
}: IProps & IBaseForm) => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [submitError, setSubmitError] = useState<Error>()
    const {
        transactionStore: { sendXCHTx, sendCATTx },
        assetsStore: { XCH },
    } = rootStore
    const {
        register,
        handleSubmit,
        watch,
        setFocus,
        formState: { isSubmitting, isSubmitSuccessful },
    } = useForm<IForm>({
        defaultValues: {
            fee: '0',
        },
    })
    const fee = watch('fee')

    useEffect(() => {
        setFocus('fee')
    }, [])

    useEffect(() => {
        if (isSubmitSuccessful) navigate(-1)
    }, [isSubmitSuccessful])

    const onSubmit = async (data: IForm) => {
        const { fee } = data
        try {
            if (asset?.assetId === 'XCH') {
                await sendXCHTx?.(address.address, amount, memo, fee)
            } else {
                await sendCATTx?.(address.address, asset, amount, memo, fee)
            }
        } catch (e) {
            throw new Error(e)
        }
    }

    return (
        <>
            <Popup
                actionButton={
                    <button
                        type="submit"
                        form="confirm-form"
                        className="btn btn-primary"
                    >
                        {t('btn-confirm')}
                    </button>
                }
                close={close}
            >
                {asset && (
                    <form
                        id="confirm-form"
                        onSubmit={(e) =>
                            handleSubmit(onSubmit)(e).catch((error) => {
                                setSubmitError(error as Error)
                            })
                        }
                        className="flex flex-col gap-10 grow"
                    >
                        <span className="text-center capitalize text-headline3">
                            {t('send-popup-title')}
                        </span>
                        <div>
                            <div className="gap-2 px-3 py-2 border rounded-lg flex-center bg-box border-primary/30">
                                <AssetIcon
                                    assetId={asset.assetId}
                                    src={asset.iconUrl}
                                />
                                <span>
                                    {amount}
                                    <span className="text-body3">
                                        {' '}
                                        {asset?.code}
                                    </span>
                                </span>
                            </div>
                            <div className="my-2 text-center capitalize text-primary-100 text-caption">
                                {t('send-popup-to')}
                            </div>
                            <div className="gap-2 px-3 py-2 border rounded-lg flex-center bg-box border-primary/30">
                                {address &&
                                    (!address.name
                                        ? shortenHash(address.address)
                                        : address.name)}
                            </div>
                        </div>
                        <div>
                            <div className="mb-3 text-center text-caption text-primary-100">
                                {t('send-fee-description')}
                            </div>
                            <div className="flex-wrap gap-2 flex-row-center">
                                {[
                                    {
                                        fee: '0',
                                        note: t('send-fee-slow'),
                                        description: '',
                                    },
                                    {
                                        fee: '0.00005',
                                        note: t('send-fee-medium'),
                                        description: '',
                                    },
                                    {
                                        fee: '0.0005',
                                        note: t('send-fee-fast'),
                                        description: '',
                                    },
                                ].map((item) => (
                                    <label
                                        key={item.note}
                                        htmlFor={item.note}
                                        className={classNames(
                                            'flex flex-col gap-1 px-3 py-4 ring-1 rounded-lg bg-white/5 hover:ring-primary shrink cursor-pointer text-subtitle1',
                                            fee === item.fee
                                                ? 'ring-primary'
                                                : 'ring-primary/30'
                                        )}
                                    >
                                        <span className="font-semibold whitespace-nowrap">
                                            {item.fee} {XCH.code}
                                        </span>
                                        <span className="capitalize text-body3 text-primary-100">
                                            {item.note}
                                        </span>
                                        <InfoIcon className="w-3 h-3 text-active" />
                                        <input
                                            type="radio"
                                            id={item.note}
                                            value={item.fee}
                                            checked={fee === item.fee}
                                            className="sr-only"
                                            {...register('fee')}
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    </form>
                )}
            </Popup>
            {isSubmitting && (
                <div className="z-50 fixed-full flex-center bg-overlay">
                    <div className="w-[60px] h-[60px] loading"></div>
                </div>
            )}
            {submitError && (
                <ErrorPopup
                    title={t('send-error-title')}
                    description={submitError.message}
                    close={() => {
                        setSubmitError(undefined)
                    }}
                />
            )}
        </>
    )
}

export default observer(TransferPopup)
