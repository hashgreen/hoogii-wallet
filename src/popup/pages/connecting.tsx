import { t } from 'i18next'
import { useEffect } from 'react'

import PopupLayout from '~/layouts/Popup'
import { APIError, MethodEnum } from '~/types/extension'

import { IPopupPageProps } from '../types'

const roundStyle =
    'flex-center p-2.5 bg-dark-scale-100 rounded-full w-20 h-20 child:full'

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
        <PopupLayout
            title={t('connecting')}
            actions={[
                {
                    children: t('btn-cancel'),
                    onClick: () => {
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
                    },
                },
            ]}
            className="pt-[60px]"
        >
            <div className="flex items-center justify-center gap-2">
                <div className={roundStyle}>
                    <img src="/images/logo.svg" alt="logo" />
                </div>
                <div className="animate-border w-10"></div>
                <div className={roundStyle}>
                    <img src={request.iconUrl} alt="icon" />
                </div>
            </div>
        </PopupLayout>
    )
}

export default Connecting
