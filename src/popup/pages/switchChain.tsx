import { t } from 'i18next'

import PopupLayout from '~/layouts/Popup'
import { MethodEnum } from '~/types/extension'
import { chains } from '~/utils/constants'

import { IPopupPageProps } from '../types'

const SwitchChain = ({
    controller,
    request,
}: IPopupPageProps<MethodEnum.REQUEST>) => {
    const chainName = chains[request?.data?.params?.chainId]?.name || 'NewWork'
    const chainId = request?.data?.params?.chainId

    const cancel = () => {
        controller.returnData({
            data: false,
        })
        window.close()
    }

    const switchChain = () => {
        controller.returnData({
            data: true,
        })
        window.close()
    }

    return (
        <PopupLayout
            title={t('switch-to-chia', { chainName })}
            description={t('switch-chain_id', { chainId })}
            actions={[
                {
                    children: t('btn-cancel'),
                    onClick: cancel,
                },
                {
                    children: t('switch'),
                    onClick: switchChain,
                },
            ]}
        ></PopupLayout>
    )
}

export default SwitchChain
