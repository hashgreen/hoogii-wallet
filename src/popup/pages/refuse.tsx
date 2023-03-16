import { useNavigate } from 'react-router-dom'

import { sendMeasurement } from '~/api/ga'
import ConnectSiteInfo from '~/popup/components/connectSiteInfo'
import { APIError, MethodEnum } from '~/types/extension'
import { ActionEnum, CategoryEnum, EventEnum } from '~/types/ga'

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
                    Connect with Hoogii:
                </div>
                <div className="flex gap-2 text-center text-body1 text-primary-100">
                    This app would like to:
                </div>
                <div className="flex w-full gap-2 mt-10 text-left text-body1">
                    Dapp’s Authorization contents
                </div>
            </div>
            <div className="flex flex-col w-full">
                <div className="mb-5 text-center text-body1 text-primary-100">
                    Only connect with sites you trust.
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
                        Cancel
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
                                        name: EventEnum.CONNECT_SITE,
                                        params: {
                                            category: CategoryEnum.CONNENT_SITE,
                                            action: ActionEnum.CLICK,
                                            value: request.origin,
                                        },
                                    },
                                ],
                            })
                            navigate('/connecting')
                        }}
                    >
                        Access
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Refuse
