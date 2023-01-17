import classNames from 'classnames'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import rootStore from '~/store'
import { MethodEnum } from '~/types/extension'
import InfoIcon from '~icons/hoogii/info.jsx'

import { IPopupPageProps } from '../types'

const Transaction = ({
    controller,
    request,
}: IPopupPageProps<MethodEnum.REQUEST>) => {
    const { t } = useTranslation()

    const {
        assetsStore: { XCH },
    } = rootStore
    const { register, handleSubmit, watch } = useForm({
        defaultValues: {
            fee: '0',
        },
    })
    const fee = watch('fee')

    const onSubmit = async (data) => {
        controller.returnData({
            data: { fee: data?.fee },
        })
        window.close()
    }

    return (
        <form
            id="confirm-form"
            onSubmit={handleSubmit(onSubmit)}
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
            <div>
                <div className="mb-3 text-left text-caption text-primary-100">
                    Address
                </div>
                <div className="bg-box flex flex-col gap-1 px-2 py-2 shrink cursor-pointer rounded-sm ">
                    xch17....c2qxc45
                </div>
            </div>
            <div>
                <div className="mb-3 text-left text-caption text-primary-100">
                    Transaction
                </div>
                <div className="bg-box flex flex-col gap-1 px-2 py-3 shrink cursor-pointer rounded-sm ">
                    <div className="text-left text-caption text-primary-100">
                        Offer
                    </div>
                    <div className="flex mb-1 flex-row justify-between">
                        <div>ABC</div>
                        <div className="text-status-receive">+100</div>
                    </div>
                    <div className="flex mb-1 flex-row justify-between">
                        <div>ABC</div>
                        <div className="text-status-send">-100</div>
                    </div>
                </div>
            </div>
            <div>
                <div className="mb-3 text-left text-caption text-primary-100">
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
        </form>
    )
}

export default Transaction
