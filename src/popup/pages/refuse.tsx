import { t } from 'i18next'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router-dom'

import { sendMeasurement } from '~/api/ga'
import PopupLayout from '~/layouts/Popup'
import { AddressInfo } from '~/popup/components'
import { APIError, MethodEnum } from '~/types/extension'
import CheckedIcon from '~icons/hoogii/checked-rounded.jsx'

import { IPopupPageProps } from '../types'

const Refuse = ({
    controller,
    request,
}: IPopupPageProps<MethodEnum.ENABLE>) => {
    const navigate = useNavigate()

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
            <AddressInfo />
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
    )
}

export default observer(Refuse)
