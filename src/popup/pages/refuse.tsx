import { t } from 'i18next'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'

import { sendMeasurement } from '~/api/ga'
import PopupLayout from '~/layouts/Popup'
import rootStore from '~/store'
import { APIError, MethodEnum } from '~/types/extension'
import { shortenHash } from '~/utils'
import CheckedIcon from '~icons/hoogii/checked-rounded.jsx'

import { IPopupPageProps } from '../types'

const Refuse = ({
    controller,
    request,
}: IPopupPageProps<MethodEnum.ENABLE>) => {
    const navigate = useNavigate()

    const {
        walletStore: { address },
    } = rootStore
    const shortenAddress = shortenHash(address)

    console.log(address, shortenAddress)

    const cancel = () => {
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
    }

    const access = () => {
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
    }

    return (
        <PopupLayout
            title={t('refuse-connect-with-hoogii')}
            request={request}
            controller={controller}
            actions={[
                { children: t('btn-cancel'), onClick: cancel },
                { children: t('btn-access'), onClick: access },
            ]}
            className="pt-8 pb-5"
        >
            <div className="flex flex-col gap-2 text-body2 text-primary-100">
                {t('current-address')}
                <div className="info-box h-10">{shortenAddress}</div>
            </div>
            <div className="flex flex-col gap-2 text-body2 text-primary-100">
                {t('refuse-you-allow-to')}
                <ul className="info-box py-4 flex-col gap-2 items-start text-body2">
                    {Array.from({ length: 2 }).map((_, index) => {
                        const key = `refuse-permission-${index + 1}`
                        return (
                            <li key={key} className="flex items-center gap-2">
                                <CheckedIcon className="w-4 h-4" />
                                {t(key)}
                            </li>
                        )
                    })}
                </ul>
            </div>
            <div className="grow"></div>
            <div className="text-body2 text-primary-100 text-center">
                {t('refuse-only-connect-with-sites-you-trust')}
            </div>
        </PopupLayout>
        // <div className="container flex flex-col justify-between w-full h-full py-12">
        //     <div className="flex flex-col items-center gap-2">
        //         <ConnectSiteInfo request={request} controller={controller} />
        //         <div className="flex gap-2 text-headline2 text-center">
        //             {t('refuse-connect-with-hoogii')}
        //         </div>
        //         <div className="flex gap-2 text-center text-body1 text-primary-100">
        //             {t('refuse-this-app-would-like-to')}
        //         </div>
        //         <div className="flex w-full gap-2 mt-10 text-left text-body1">
        //             {t('refuse-authorization-contents')}
        //         </div>
        //     </div>
        //     <div className="flex flex-col w-full">
        //         <div className="mb-5 text-center text-body1 text-primary-100">
        //             {t('refuse-only-connect-with-sites-you-trust')}
        //         </div>
        //         <div className="flex justify-between">
        //             <button
        //                 className="btn btn-CTA_landing btn-outline  w-[160px] h-[40px] btn-large"
        //                 onClick={() => {
        //                     if (request.method === MethodEnum.REQUEST) {
        //                         controller.returnData({
        //                             data: false,
        //                         })
        //                     } else {
        //                         controller.returnData({
        //                             error: APIError.REFUSED,
        //                         })
        //                     }
        //                     window.close()
        //                 }}
        //             >
        //                 {t('btn-cancel')}
        //             </button>
        //             <button
        //                 className="btn btn-CTA_landing  w-[160px] h-[40px] btn-large"
        //                 onClick={() => {
        //                     // await rootStore.walletStore.db.connectedSites.add({
        //                     //     name: request.origin,
        //                     //     url: request.origin,
        //                     // })
        //                     // controller.checkIsConnectedSite()
        //                     sendMeasurement({
        //                         events: [
        //                             {
        //                                 name: 'connect_site',
        //                                 params: {
        //                                     category: 'connent_site',
        //                                     action: 'click',
        //                                     value: request.origin,
        //                                 },
        //                             },
        //                         ],
        //                     })
        //                     navigate('/connecting')
        //                 }}
        //             >
        //                 {t('btn-access')}
        //             </button>
        //         </div>
        //     </div>
        // </div>
    )
}

export default observer(Refuse)
