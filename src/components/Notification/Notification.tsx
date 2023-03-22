import classNames from 'classnames'
import { t } from 'i18next'
import React from 'react'

import { INotification } from '~/types/notification'

import Popup from '../Popup'
const Notification = ({
    id,
    onClose,
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
                <button className="notification-popup-button" onClick={onClose}>
                    {t('btn-got-it')}
                </button>
            }
            close={onClose}
            btnClassName={classNames('notification-popup-container-button')}
            closeBtn={false}
            className={classNames('notification-popup-container')}
            childrenClassName={classNames('notification-popup-content')}
        >
            <div className="">
                {img && <img src={img} className="notification-popup-img" />}

                <h3 className="notification-popup-text notification-popup-text-title">
                    {title}
                </h3>

                <h3 className="notification-popup-text notification-popup-text-subtitle">
                    {subtitle}
                </h3>
            </div>
            {/* list */}
            <ul className="notification-popup-list">
                {contents &&
                    contents.map(({ title, description }) => (
                        <li key={title} className="">
                            <ol>
                                <h3 className="notification-popup-list-title">
                                    {title}
                                </h3>
                            </ol>

                            {description && (
                                <p className="notification-popup-list-content">
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
