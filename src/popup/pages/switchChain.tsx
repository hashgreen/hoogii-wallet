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
            <div className="flex flex-col gap-2 items-center">
                <div className="flex gap-2  text-center text-xl ">
                    Switch to Chia {ChainName?.name || 'NewWork'}?
                </div>
                <div className="flex gap-2  text-center text-sm ">
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
                        Cancel
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
                        Switch
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SwitchChain
