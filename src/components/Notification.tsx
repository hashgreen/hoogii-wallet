import { t } from 'i18next'
import { useEffect, useState } from 'react'

import { INotification } from '~/types/notification'
import { getStorage, setStorage } from '~/utils/extension/storage'
import CloseIcon from '~icons/hoogii/close.jsx'

import pkg from '../../package.json'
import versionData from '../../public/data/version.json'
const Notification = () => {
    const [data, setData] = useState<INotification[]>([])

    const handleOnClose = (version?: string) => {
        if (version) {
            setStorage({ last_version_notification: version })
        }

        const newData = data.slice(1)

        setData(newData)
    }

    const initData = async () => {
        const localData =
            (await getStorage<INotification[]>('notifications')) || []
        setData(localData)
        // check whether the version notification has been displayed
        const curVersion = pkg.version.split('-')[0]

        const last_version_notification =
            (await getStorage<string>('last_version_notification')) || false

        if (
            !last_version_notification ||
            curVersion > last_version_notification
        ) {
            setData([...data, versionData])
        }
    }
    useEffect(() => {
        initData()

        // TODO: listen for websocket messages for other notifications
    }, [])

    return (
        data[0] && (
            <div className="flex items-center justify-center absolute-full bg-overlay">
                <div
                    key="notification"
                    className="w-[336px]  flex flex-col rounded-xl  max-h-[472px] bg-white  z-50  fixed  flex-center p-5"
                >
                    <div
                        onClick={() => handleOnClose(data[0].version)}
                        className="text-[#5F6881] absolute top-5 right-5 cursor-pointer text-lg"
                    >
                        <CloseIcon />
                    </div>
                    <div className="text-secondary">
                        {data[0].img && (
                            <img src={data[0].img} className="mx-auto mb-2" />
                        )}

                        <h3 className="text-xl font-semibold text-center">
                            {data[0].title}
                        </h3>

                        <p className=" mt-2 font-semibold text-sm leading-[17px] text-center text-primary-500">
                            {data[0].subtitle}
                        </p>
                    </div>
                    {/* list */}
                    <ul className="flex flex-col max-h-full gap-2 pl-10 mt-4 overflow-scroll list-disc list-outside">
                        {data[0].contents &&
                            data[0].contents.map(({ title, description }) => (
                                <li key={title} className="">
                                    <ol>
                                        <h3 className="text-left text-black text-subtitle2">
                                            {title}
                                        </h3>
                                    </ol>

                                    {description && (
                                        <p className=" text-body2 text-[#5F6881] font-normal ">
                                            {description}
                                        </p>
                                    )}
                                </li>
                            ))}
                    </ul>

                    <button
                        className="btn-md-primary"
                        onClick={() => handleOnClose(data[0].version)}
                    >
                        {t('btn-got-it')}
                    </button>
                </div>
            </div>
        )
    )
}
export default Notification
