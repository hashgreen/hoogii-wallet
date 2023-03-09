import { MethodEnum } from '~/types/extension'

import { IPopupPageProps } from '../types'

const connectSiteInfo = ({
    request,
}: IPopupPageProps<MethodEnum.REQUEST | MethodEnum.ENABLE>) => {
    return (
        <div className="min-w-[164px] h-[44px] border-solid border-primary-100 border rounded-lg flex justify-center items-center m-1 p-1">
            <img src={request.iconUrl} alt="icon" className="w-7 h-7 mr-1" />
            <div className="text-body3 text-primary-100 break-all overflow-hidden text-ellipsis ">
                {request.origin}
            </div>
        </div>
    )
}

connectSiteInfo.propTypes = {}

export default connectSiteInfo
