import { JsonView } from 'react-json-view-lite'

import { MethodEnum } from '~/types/extension'

import { IPopupPageProps } from '../types'
function pushTxInfo({ request }: IPopupPageProps<MethodEnum.REQUEST>) {
    return (
        <div>
            <div className="mb-3 text-left text-caption text-primary-100">
                Send Transaction spendBundle:
            </div>

            <div className="bg-box flex flex-col gap-1 px-2 py-3 shrink cursor-pointer rounded-sm ">
                <div className="text-left text-caption text-primary-100 h-[180px] overflow-y-auto">
                    <JsonView
                        data={request?.data?.params?.spendBundle}
                        shouldInitiallyExpand={() => true}
                    />
                </div>
            </div>
        </div>
    )
}
export default pushTxInfo
