import { useNavigate } from 'react-router-dom'

import { APIError, MethodEnum } from '~/types/extension'

import { IPopupPageProps } from '../types'

const Refuse = ({ controller }: IPopupPageProps<MethodEnum.ENABLE>) => {
    const navigate = useNavigate()

    return (
        <div className="container flex flex-col justify-between h-full py-10 bg-main dark ">
            <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                    You need to connect wallet first
                </div>
                <div className="flex gap-2">
                    Do you want to connect wallet now?
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
                    onClick={() => {
                        navigate('/enable')
                    }}
                >
                    Connect
                </button>
            </div>
        </div>
    )
}

export default Refuse
