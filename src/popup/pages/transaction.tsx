import { AxiosError } from 'axios'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import FeesRadio, {
    createDefaultFeeOptions,
    createFeeOptions,
    useDynamicFeeOptions,
} from '~/components/FeesRadio'
import { ErrorPopup } from '~/components/Popup'
import PopupLayout from '~/layouts/Popup'
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

import { AddressInfo, FeeInfo } from '../components'
import { IPopupPageProps } from '../types'
const withoutFee = [
    RequestMethodEnum.SEND_TRANSACTION,
    RequestMethodEnum.SIGN_COIN_SPENDS,
]

const Transaction = ({
    controller,
    request,
}: IPopupPageProps<MethodEnum.REQUEST>) => {
    const { t, i18n } = useTranslation()
    const [submitError, setSubmitError] = useState<Error>()
    const {
        assetsStore: { XCH },
        transactionStore: {
            isTradable,
            createTransferSpendBundle,
            getFees,
            sendXCHTx,
            sendCATTx,
        },
    } = rootStore

    const {
        register,
        handleSubmit,
        watch,
        setFocus,
        formState: { isSubmitting },
    } = useForm<{ fee: 'fast' | `medium-${number}` | 'medium' | 'slow' }>({
        defaultValues: {
            fee: 'fast',
        },
    })
    const fee = watch('fee')

    const updateFeeOptions = useCallback(async () => {
        try {
            let spendBundle
            switch (request.data?.method) {
                case RequestMethodEnum.CREATE_OFFER: {
                    // TODO: disable dynamic fees on CREATE_OFFER
                    // const { offerAssets }: OfferParams = request.data.params
                    // spendBundle = await Offer.generateSecureBundle(
                    //     [],
                    //     offerAssets
                    // )
                    break
                }
                case RequestMethodEnum.TRANSFER: {
                    const { to, assetId, amount, memos }: TransferParams =
                        request.data.params
                    spendBundle = await createTransferSpendBundle({
                        targetAddress: to,
                        asset: assetId,
                        amount,
                        memos,
                    })
                    break
                }
                default:
                    break
            }
            if (!spendBundle) return
            const fees = await getFees(spendBundle)
            return createFeeOptions(
                fees.map(({ time, fee }) => ({
                    time,
                    fee:
                        fee *
                        (request.data?.method === RequestMethodEnum.CREATE_OFFER
                            ? 2
                            : 1),
                })),
                { t, i18n }
            )
        } catch (error) {}
    }, [isTradable, request.data?.method, request.data?.params])
    const { feeOptions, isLoading } = useDynamicFeeOptions(
        createDefaultFeeOptions({ t }),
        updateFeeOptions
    )

    useEffect(() => {
        setFocus('fee')
    }, [isLoading])

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
        const fee = (
            request?.data?.params.fee ??
            xchToMojo(
                feeOptions.find((option) => option.key === data?.fee)?.fee ?? 0
            )
        ).toString()
        if (request.data?.method === RequestMethodEnum.CREATE_OFFER) {
            try {
                const offer = await createOffer(request.data?.params, fee)
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
            await transfer(request.data?.params, fee)
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

    const cancel = () => {
        controller.returnData({
            data: false,
        })
        window.close()
    }

    return (
        <PopupLayout
            as="form"
            id="confirm-form"
            onSubmit={(e) =>
                handleSubmit(onSubmit)(e).catch((error) => {
                    setSubmitError(error as Error)
                })
            }
            title={t('offier-request-signature-for')}
            request={request}
            controller={controller}
            actions={[
                {
                    children: t('btn-cancel'),
                    onClick: cancel,
                    disabled: isSubmitting,
                },
                {
                    children: t('btn-sign'),
                    type: 'submit',
                },
            ]}
            className="overflow-hidden gap-4 pt-8 pb-10"
        >
            <AddressInfo />
            <div className="flex flex-col gap-2 overflow-hidden">
                {request.data?.method === RequestMethodEnum.CREATE_OFFER && (
                    <OfferInfo request={request} controller={controller} />
                )}

                {request.data?.method === RequestMethodEnum.TRANSFER && (
                    <TransferInfo request={request} controller={controller} />
                )}

                {request.data?.method ===
                    RequestMethodEnum.SEND_TRANSACTION && (
                    <SpendBundleInfo
                        request={request}
                        controller={controller}
                    />
                )}

                {request.data?.method ===
                    RequestMethodEnum.SIGN_COIN_SPENDS && (
                    <SpendBundleInfo
                        request={request}
                        controller={controller}
                    />
                )}

                {!withoutFee.some(
                    (method) => request.data?.method === method
                ) && (
                    <div className="flex flex-col gap-2 text-body2 text-primary-100 overflow-hidden">
                        {request?.data?.params.fee
                            ? t('fee')
                            : t('send-fee-description')}
                        {request?.data?.params.fee &&
                        request.data.params.fee > 0 ? (
                            <FeeInfo fee={request.data.params.fee} />
                        ) : (
                            <FeesRadio
                                XCH={XCH}
                                fee={fee}
                                fees={feeOptions}
                                register={register}
                                name="fee"
                                isLoading={isLoading}
                            />
                        )}
                    </div>
                )}
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
        </PopupLayout>
    )
}

export default observer(Transaction)
