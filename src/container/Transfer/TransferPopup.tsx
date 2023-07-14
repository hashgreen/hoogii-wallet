import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import AssetIcon from '~/components/AssetIcon'
import FeesRadio, {
    createDefaultFeeOptions,
    createFeeOptions,
    useDynamicFeeOptions,
} from '~/components/FeesRadio'
import Popup, { ErrorPopup } from '~/components/Popup'
import rootStore from '~/store'
import { shortenHash } from '~/utils'
import { catToMojo, xchToMojo } from '~/utils/CoinConverter'

import { IForm as IBaseForm } from './Transfer'

interface IProps {
    close: () => void
}

interface IForm {
    fee: 'fast' | `medium-${number}` | 'medium' | 'slow'
}

const TransferPopup = ({
    address,
    asset,
    amount,
    memo,
    close,
}: IProps & IBaseForm) => {
    const { t, i18n } = useTranslation()
    const navigate = useNavigate()
    const [submitError, setSubmitError] = useState<Error>()
    const {
        transactionStore: {
            isTradable,
            createTransferSpendBundle,
            getFees,
            sendXCHTx,
            sendCATTx,
        },
        assetsStore: { XCH },
    } = rootStore
    const {
        register,
        handleSubmit,
        watch,
        setFocus,
        formState: { isSubmitting },
    } = useForm<IForm>({
        defaultValues: {
            fee: 'fast',
        },
    })
    const fee = watch('fee')

    const updateFeeOptions = useCallback(async () => {
        try {
            const spendBundle = await createTransferSpendBundle({
                targetAddress: address.address,
                amount: xchToMojo(amount).toString(),
                memos: [memo],
            })
            if (!spendBundle) return
            const fees = await getFees(spendBundle)
            return createFeeOptions(fees, { t, i18n })
        } catch (error) {
            console.error(error)
        }
    }, [isTradable, address.address, amount, memo])

    const { feeOptions, isLoading } = useDynamicFeeOptions(
        createDefaultFeeOptions({ t }),
        updateFeeOptions
    )

    useEffect(() => {
        setFocus('fee')
    }, [isLoading])

    const onSubmit = async (data: IForm) => {
        const fee =
            feeOptions.find((option) => option.key === data?.fee)?.fee ?? 0
        const memos: string[] = []
        if (memo) {
            memos.push(memo)
        }
        if (asset?.assetId === XCH.assetId) {
            await sendXCHTx?.(
                address.address,
                xchToMojo(amount).toString(),
                xchToMojo(fee).toString(),
                memos
            )
        } else {
            await sendCATTx?.(
                address.address,
                asset?.assetId,
                catToMojo(amount).toString(),
                xchToMojo(fee).toString(),
                memos
            )
        }
        navigate(-1)
    }

    return (
        <>
            <Popup
                actionButton={
                    <button
                        type="submit"
                        form="confirm-form"
                        className="btn btn-primary"
                        disabled={isSubmitting}
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
                            <FeesRadio
                                XCH={XCH}
                                fee={fee}
                                fees={feeOptions}
                                register={register}
                                name="fee"
                                isLoading={isLoading}
                            />
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
