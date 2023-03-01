import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useLayoutEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { sendTx } from '~/api/api'
import { ErrorPopup } from '~/components/Popup'
import OfferInfo from '~/popup/components/offerInfo'
import PushTxInfo from '~/popup/components/pushTxInfo'
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

        return new Offer(secureBundle)
    }

    const transfer = async (params: TransferParams, fee: string) => {
        if (params.to) {
            await sendCATTx?.(
                params.to,
                params.assetId,
                params.amount,
                fee,
                params.memos
            )
        } else {
            await sendXCHTx?.(params.to, params.amount, fee, params.memos)
        }
    }

    const onSubmit = async (data) => {
        if (request.data?.method === RequestMethodEnum.CREATE_OFFER) {
            const offer = await createOffer(
                request.data?.params,
                xchToMojo(data?.fee).toString()
            )
            controller.returnData({
                data: { id: offer.getId(), offer: offer.encode(5) },
            })
            window.close()
        }
        if (request.data?.method === RequestMethodEnum.TRANSFER) {
            await transfer(
                request.data?.params,
                xchToMojo(data?.fee).toString()
            )
            window.close()
        }

        if (request.data?.method === RequestMethodEnum.SEND_TRANSACTION) {
            await sendTx({
                data: {
                    spend_bundle: request.data?.params?.spendBundle,
                },
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
                    console.log('error', error)
                    setSubmitError(error as Error)
                })
            }
            className="container flex flex-col justify-between  w-full h-full py-12"
        >
            <div className="flex flex-col gap-2 items-center">
                <div className="w-[164px] h-[44px] border-solid border-primary-100 border rounded-lg flex justify-center items-center m-1">
                    <img src={request.iconUrl} alt="icon" className="w-7 h-7" />
                    <div className="text-body3 text-primary-100">
                        {request.origin}
                    </div>
                </div>
                <div className="flex gap-2 text-center text-xl">
                    Requests a signature for:
                </div>
            </div>
            {request.data?.method === RequestMethodEnum.CREATE_OFFER && (
                <OfferInfo request={request} controller={controller} />
            )}

            {request.data?.method === RequestMethodEnum.TRANSFER && (
                <TransferInfo request={request} controller={controller} />
            )}

            {request.data?.method === RequestMethodEnum.SEND_TRANSACTION && (
                <PushTxInfo request={request} controller={controller} />
            )}
            {request.data?.method !== RequestMethodEnum.SEND_TRANSACTION && (
                <div className="w-max">
                    <div className="mb-3 text-left text-caption text-primary-100">
                        {t('send-fee-description')}
                    </div>
                    <div className="flex-wrap gap-2  flex-row-center ">
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
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-CTA_landing  w-[160px] h-[40px] btn-large"
                        type="submit"
                    >
                        Sign
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
