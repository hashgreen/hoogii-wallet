import { t } from 'i18next'
import { useNavigate } from 'react-router-dom'

import { sendMeasurement } from '~/api/ga'
import ConnectSiteInfo from '~/popup/components/connectSiteInfo'
import { APIError, MethodEnum } from '~/types/extension'

import { IPopupPageProps } from '../types'

const Refuse = ({
    controller,
    request,
}: IPopupPageProps<MethodEnum.ENABLE>) => {
    const navigate = useNavigate()

    return (
        <div className="container flex flex-col justify-between w-full h-full py-12">
            <div className="flex flex-col items-center gap-2">
                <ConnectSiteInfo request={request} controller={controller} />
                <div className="flex gap-2 text-xl text-center">
                    {t('refuse-connect-with-hoogii')}
                </div>
                <div className="flex gap-2 text-center text-body1 text-primary-100">
                    {t('refuse-this-app-would-like-to')}
                </div>
                <div className="flex w-full gap-2 mt-10 text-left text-body1">
                    {t('refuse-authorization-contents')}
                </div>
            </div>
            <div className="flex flex-col w-full">
                <div className="mb-5 text-center text-body1 text-primary-100">
                    {t('refuse-only-connect-with-sites-you-trust')}
                </div>
                <div className="flex justify-between">
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
                    <button
                        className="btn btn-CTA_landing  w-[160px] h-[40px] btn-large"
                        onClick={() => {
                            // await rootStore.walletStore.db.connectedSites.add({
                            //     name: request.origin,
                            //     url: request.origin,
                            // })
                            // controller.checkIsConnectedSite()
                            sendMeasurement({
                                events: [
                                    {
                                        name: 'connect_site',
                                        params: {
                                            category: 'connent_site',
                                            action: 'click',
                                            value: request.origin,
                                        },
                                    },
                                ],
                            })
                            navigate('/connecting')
                        }}
                    >
                        {t('btn-access')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Refuse
