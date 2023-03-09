import { useNavigate } from 'react-router-dom'

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
            <div className="flex flex-col gap-2 items-center">
                <ConnectSiteInfo request={request} controller={controller} />
                <div className="flex gap-2 text-center text-xl">
                    Connect with Hoogii:
                </div>
                <div className="flex gap-2  text-center text-body1 text-primary-100">
                    This app would like to:
                </div>
                <div className="flex gap-2  text-body1 text-left w-full mt-10">
                    Dapp’s Authorization contents
                </div>
            </div>
            <div className="flex flex-col w-full">
                <div className="text-center mb-5 text-body1 text-primary-100">
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
                        onClick={async () => {
                            // await rootStore.walletStore.db.connectedSites.add({
                            //     name: request.origin,
                            //     url: request.origin,
                            // })
                            // controller.checkIsConnectedSite()
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
