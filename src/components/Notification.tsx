import classNames from 'classnames'
import { t } from 'i18next'
import React from 'react'

import { notification } from '~/store/NotificationStore'
import { INotification } from '~/types/notification'

import Popup from './Popup'
const Notification = ({
    id,
    title,
    subtitle,
    contents,
    img,
}: INotification) => {
    return (
        <Popup
            id={id}
            closeIconBtn={true}
            actionButton={
                <button
                    className="btn-md-primary"
                    onClick={() => notification.close(id)}
                >
                    {t('btn-got-it')}
                </button>
            }
            close={() => notification.close(id)}
            btnClassName="!pb-0"
            closeBtn={false}
            className="w-[336px]  rounded-xl  max-h-[472px] !bg-white opacity-100 z-50 !ring-0 !p-5 "
            childrenClassName="!gap-0 !p-0 overflow-y-hidden"
        >
            <div className="text-secondary">
                {img && <img src={img} className="mx-auto mb-2" />}

                <h3 className="text-xl font-semibold text-center">{title}</h3>

                <p className=" mt-2 font-semibold text-sm leading-[17px] text-center text-primary-500">
                    {subtitle}
                </p>
            </div>
            {/* list */}
            <ul className="flex flex-col max-h-full gap-2 pl-5 mt-4 overflow-scroll list-disc list-outside">
                {contents &&
                    contents.map(({ title, description }) => (
                        <li key={title} className="">
                            <ol>
                                <h3 className="text-left text-subtitle2">
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
        </Popup>
    )
}
export default Notification
