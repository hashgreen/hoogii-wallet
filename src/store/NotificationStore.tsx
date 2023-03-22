import { ReactElement, ReactNode } from 'react'
import ReactDOM from 'react-dom'
import { v4 as uuidv4 } from 'uuid'

import Notification from '~/components/Notification'
import { getStorage, setStorage } from '~/utils/extension/storage'

import {
    INotification,
    TxRewardNotification,
    VersionNotification,
} from '../types/notification'

export class NotificationManager {
    private containerRef: HTMLDivElement
    private notification: INotification[] = []

    constructor() {
        const body = document.getElementsByTagName('body')[0] as HTMLBodyElement
        const container = document.createElement('div') as HTMLDivElement
        container.id = 'notification-container-main'
        body.insertAdjacentElement('beforeend', container)
        this.containerRef = container
    }

    public async refresh() {
        const data = (await getStorage<INotification[]>('notification')) || []
        this.notification = data
        if (data.length === 0) {
            setStorage({ notification: [] })
        } else {
            this.render()
        }
    }

    public add(options: VersionNotification | TxRewardNotification): void {
        const notificationId = uuidv4()
        const notification: INotification = {
            ...options, // if id is passed within options, it will overwrite the auto-generated one
            id: `notification-${notificationId}`,
        }

        const data = [...this.notification, notification]

        this.notification = [...data]
        setStorage({ notification: [...data] })
        this.render()
    }

    public close(id: string): void {
        console.log(
            '🚀 ~ file: NotificationStore.tsx:49 ~ NotificationManager ~ close ~ id:',
            id
        )
        const data = this.notification.filter(
            (notification: INotification) => notification.id !== id
        )

        this.notification = data
        setStorage({ notification: data })

        const element = document.getElementById(id)
        if (element) {
            console.log(
                '🚀 ~ file: NotificationStore.tsx:59 ~ NotificationManager ~ close ~ element:',
                element
            )
            element.remove()
        }
        this.render()
    }

    private render(): void {
        const element = this.notification[0]
        console.log(
            '🚀 ~ file: NotificationStore.tsx:61 ~ NotificationManager ~ render ~ element:',
            element
        )
        if (element) {
            ReactDOM.render(
                <Notification {...element} key={element.id} />,
                this.containerRef
            )
        }
    }
}
export const notification = new NotificationManager()
