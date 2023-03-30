import { t } from 'i18next'
import { useEffect } from 'react'

import { APIError, MethodEnum } from '~/types/extension'

import { IPopupPageProps } from '../types'

const roundStyle = 'justify-center p-4 items-center bg-white m-1 rounded-full'

const Connecting = ({
    controller,
    request,
}: IPopupPageProps<MethodEnum.ENABLE>) => {
    useEffect(() => {
        setTimeout(() => {
            controller.connectedSite()
        }, 2000)
    })
    return (
        <div className="container flex flex-col justify-between w-full h-full py-12">
            <div className="flex flex-col items-center gap-2">
                <div className="flex gap-2 text-2xl text-center">
                    {t('connecting')}
                </div>
                <div className="flex items-center justify-center mt-10">
                    <div className={roundStyle}>
                        <img
                            src="/images/logo.svg"
                            alt="logo"
                            className="w-12 h-12"
                        />
                    </div>
                    <div className="">-–––-</div>
                    <div className={roundStyle}>
                        <img
                            src={request.iconUrl}
                            alt="icon"
                            className="w-12 h-12"
                        />
                    </div>
                </div>
            </div>
            <div className="flex flex-col w-full">
                <div className="flex justify-center">
                    <button
                        className="btn btn-CTA_landing btn-outline  w-[160px] h-[40px] btn-large"
                        onClick={() => {
                            if (request.method === MethodEnum.REQUEST) {
                                controller.returnData({
                                    data: false,
                                })
                            } else {
                                controller.returnData({
                                    error: APIError.REFUSED,
                                })
                            }
                            window.close()
                        }}
                    >
                        {t('btn-cancel')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Connecting
