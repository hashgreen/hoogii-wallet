import { t } from 'i18next'

import { MethodEnum } from '~/types/extension'
import { chains } from '~/utils/constants'

import { IPopupPageProps } from '../types'

const SwitchChain = ({
    controller,
    request,
}: IPopupPageProps<MethodEnum.REQUEST>) => {
    const ChainName = chains[request?.data?.params?.chainId]
    return (
        <div className="container flex flex-col justify-between w-full h-full py-12">
            <div className="flex flex-col items-center gap-2">
                <div className="flex gap-2 text-xl text-center ">
                    {t('switch-to-chia')} {ChainName?.name || 'NewWork'}?
                </div>
                <div className="flex gap-2 text-sm text-center ">
                    Chain ID: {request?.data?.params?.chainId}
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
                        {t('btn-cancel')}
                    </button>
                    <button
                        className="btn btn-CTA_landing  w-[160px] h-[40px] btn-large"
                        onClick={async () => {
                            controller.returnData({
                                data: true,
                            })
                            window.close()
                        }}
                    >
                        {t('switch')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SwitchChain
