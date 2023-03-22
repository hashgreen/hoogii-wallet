import { ReactElement, ReactNode } from 'react'
import ReactDOM from 'react-dom'
import { v4 as uuidv4 } from 'uuid'

import {
    INotification,
    TxRewardNotification,
    VersionNotification,
} from '../../types/notification'
import Notification from './Notification'
export class NotificationManager {
    private containerRef: HTMLDivElement
    private notification: INotification[] = []

    constructor() {
        const body = document.getElementsByTagName('body')[0] as HTMLBodyElement
        const toastContainer = document.createElement('div') as HTMLDivElement
        toastContainer.id = 'notification-container-main'
        body.insertAdjacentElement('beforeend', toastContainer)
        this.containerRef = toastContainer
    }

    public add(options: VersionNotification | TxRewardNotification): void {
        const notificationId = uuidv4()
        const notification: INotification = {
            ...options, // if id is passed within options, it will overwrite the auto-generated one
            id: `notification-${notificationId}`,
            onClose: () => this.close(`notification-${notificationId}`),
        }

        this.notification = [notification, ...this.notification]
        this.render()
    }

    public close(id: string): void {
        console.log('onCLose', id)
        console.log(
            '🚀 ~ file: index.tsx:40 ~ NotificationManager ~ close ~  this.notification:',
            this.notification
        )
        this.notification = this.notification.filter(
            (notification: INotification) => notification.id !== id
        )
        const element = document.getElementById(`notification-${id}`)
        if (element) {
            element.remove()
        }
        this.render()
    }

    private render(): void {
        const notificationList: ReactElement = this.notification.length ? (
            <Notification
                key={this.notification[0].id}
                {...this.notification[0]}
            />
        ) : (
            <></>
        )
        ReactDOM.render(notificationList, this.containerRef)
    }
}

export const notification = new NotificationManager()
