import { AxiosError } from 'axios'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useLayoutEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { ErrorPopup } from '~/components/Popup'
import ConnectSiteInfo from '~/popup/components/connectSiteInfo'
import OfferInfo from '~/popup/components/offerInfo'
import SpendBundleInfo from '~/popup/components/spendBundleInfo'
import TransferInfo from '~/popup/components/transferInfo'
import rootStore from '~/store'
import {
    MethodEnum,
    OfferParams,
    RequestMethodEnum,
    TransferParams,
} from '~/types/extension'
import { xchToMojo } from '~/utils/CoinConverter'
import Offer from '~/utils/Offer'
import InfoIcon from '~icons/hoogii/info.jsx'

import { IPopupPageProps } from '../types'
const withoutFee = [
    RequestMethodEnum.SEND_TRANSACTION,
    RequestMethodEnum.SIGN_COIN_SPENDS,
]

const Transaction = ({
    controller,
    request,
}: IPopupPageProps<MethodEnum.REQUEST>) => {
    const { t } = useTranslation()
    const [submitError, setSubmitError] = useState<Error>()
    const {
        assetsStore: { XCH },
        transactionStore: { sendXCHTx, sendCATTx },
    } = rootStore

    const {
        register,
        handleSubmit,
        watch,
        formState: { isSubmitting },
    } = useForm({
        defaultValues: {
            fee: '0',
        },
    })
    const fee = watch('fee')
    const createOffer = async (
        params: OfferParams,
        fee?: string
    ): Promise<Offer> => {
        const { requestAssets, offerAssets } = params
        const secureBundle = await Offer.generateSecureBundle(
            requestAssets,
            offerAssets,
            fee
        )

        console.log('secureBundle', secureBundle)

        return new Offer(secureBundle)
    }

    const transfer = async (params: TransferParams, fee: string) => {
        if (params.assetId) {
            await sendCATTx(
                params.to,
                params.assetId,
                params.amount,
                fee,
                params.memos
            )
        } else {
            await sendXCHTx(params.to, params.amount, fee, params.memos)
        }
    }

    const onSubmit = async (data: any) => {
        if (request.data?.method === RequestMethodEnum.CREATE_OFFER) {
            try {
                const offer = await createOffer(
                    request.data?.params,
                    xchToMojo(data?.fee).toString()
                )
                controller.returnData({
                    data: { id: offer.getId(), offer: offer.encode(5) },
                })
            } catch (error) {
                const resError = error as AxiosError

                const message =
                    resError.message || resError?.response?.data?.msg
                controller.returnData({
                    data: { error: true, message },
                })
            }
            window.close()
        }
        if (request.data?.method === RequestMethodEnum.TRANSFER) {
            await transfer(
                request.data?.params,
                xchToMojo(data?.fee).toFixed().toString()
            )
            controller.returnData({
                data: true,
            })
            window.close()
        }
        if (request.data?.method === RequestMethodEnum.SIGN_COIN_SPENDS) {
            controller.returnData({
                data: true,
            })
            window.close()
        }
    }

    useLayoutEffect(() => {
        rootStore.walletStore.init()
    }, [])

    return (
        <form
            id="confirm-form"
            onSubmit={(e) =>
                handleSubmit(onSubmit)(e).catch((error) => {
                    console.error('error', error)
                    setSubmitError(error as Error)
                })
            }
            className="container flex flex-col justify-between w-full h-full py-12"
        >
            <div className="flex flex-col items-center gap-2">
                <ConnectSiteInfo request={request} controller={controller} />
                <div className="flex gap-2 text-xl text-center">
                    {t('offier-request-signature-for')}
                </div>
            </div>
            {request.data?.method === RequestMethodEnum.CREATE_OFFER && (
                <OfferInfo request={request} controller={controller} />
            )}

            {request.data?.method === RequestMethodEnum.TRANSFER && (
                <TransferInfo request={request} controller={controller} />
            )}

            {request.data?.method === RequestMethodEnum.SEND_TRANSACTION && (
                <SpendBundleInfo request={request} controller={controller} />
            )}

            {request.data?.method === RequestMethodEnum.SIGN_COIN_SPENDS && (
                <SpendBundleInfo request={request} controller={controller} />
            )}

            {!withoutFee.some((method) => request.data?.method === method) && (
                <div className="w-max">
                    <div className="mb-3 text-left text-caption text-primary-100">
                        {t('send-fee-description')}
                    </div>
                    <div className="flex-wrap gap-2 flex-row-center ">
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
            )}

            <div className="flex flex-col w-full">
                <div className="flex justify-between">
                    <button
                        className="btn btn-CTA_landing btn-outline  w-[160px] h-[40px] btn-large"
                        onClick={() => {
                            controller.returnData({
                                data: false,
                            })
                            window.close()
                        }}
                        disabled={isSubmitting}
                    >
                        {t('btn-cancel')}
                    </button>
                    <button
                        className="btn btn-CTA_landing  w-[160px] h-[40px] btn-large"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {t('btn-sign')}
                    </button>
                </div>
            </div>
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
        </form>
    )
}

export default observer(Transaction)
