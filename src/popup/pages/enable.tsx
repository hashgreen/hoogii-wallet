import { db } from '~/db'
import { APIError, MethodEnum } from '~/types/extension'

import { IPopupPageProps } from '../types'

const Enable = ({
    request,
    controller,
}: IPopupPageProps<MethodEnum.ENABLE>) => {
    return (
        <div className="container flex flex-col justify-between h-full py-10 bg-main dark ">
            <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                    <img src={request.iconUrl} alt="icon" className="h-full" />
                    <input
                        type="text"
                        defaultValue={request.origin}
                        className="input"
                        readOnly
                    />
                </div>
            </div>
            <div className="flex justify-between w-full">
                <button
                    className="btn btn-CTA_landing btn-outline"
                    onClick={() => {
                        controller.returnData({
                            error: APIError.REFUSED,
                        })
                        window.close()
                    }}
                >
                    Cancel
                </button>
                <button
                    className="btn btn-CTA_landing"
                    onClick={async () => {
                        await db.connectedSites.add({
                            name: request.origin,
                            url: request.origin,
                        })
                        controller.returnData({
                            data: true,
                        })
                        window.close()
                    }}
                >
                    Sign
                </button>
            </div>
        </div>
    )
}

export default Enable
