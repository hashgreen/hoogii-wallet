import classNames from 'classnames'
import { t } from 'i18next'
import React from 'react'

import Popup from './Popup'

interface IProps {}

const NotificationPopup = ({}: IProps) => {
    return (
        <Popup
            closeIconBtn={true}
            actionButton={
                <button className="notification-popup-button">
                    {t('btn-got-it')}
                </button>
            }
            btnClassName={classNames('notification-popup-container-button')}
            closeBtn={false}
            className={classNames('notification-popup-container')}
            childrenClassName={classNames('notification-popup-content')}
        >
            <div className="">
                <h3 className="notification-popup-text notification-popup-text-title">
                    Notification Popup
                </h3>

                <h3 className="notification-popup-text notification-popup-text-subtitle">
                    Notification Popup
                </h3>
            </div>
            {/* list */}
            <ul className="notification-popup-list">
                <li className="notification-popup-list-title">
                    <h3>title</h3>
                    <p className="notification-popup-list-content">content</p>
                </li>
            </ul>
        </Popup>
    )
}
export default NotificationPopup
