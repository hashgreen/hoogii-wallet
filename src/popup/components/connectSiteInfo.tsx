import { MethodEnum } from '~/types/extension'

import { IPopupPageProps } from '../types'

const connectSiteInfo = ({
    request,
}: IPopupPageProps<MethodEnum.REQUEST | MethodEnum.ENABLE>) => {
    return (
        <div
            title={request.origin}
            className="flex max-w-full gap-2 px-4 py-2 text-button2 text-primary-100 items-center border-primary-100/20 border rounded-lg"
        >
            <img
                src={request.iconUrl}
                alt="icon"
                className="w-7 h-7 bg-primary-100 rounded-full"
            />
            <div className="whitespace-nowrap text-ellipsis overflow-hidden">
                {request.origin}
            </div>
        </div>
    )
}

connectSiteInfo.propTypes = {}

export default connectSiteInfo
