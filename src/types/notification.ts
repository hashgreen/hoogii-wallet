interface IContnet {
    title: string
    description?: string
}

export interface INotification {
    id?: string
    img?: string
    title: string
    subtitle: string
    contents?: IContnet[]
    onClose: () => void
}

export type NotificationType = 'version' | 'reward'

export type VersionNotification = Pick<
    INotification,
    'title' | 'subtitle' | 'contents'
>

export type TxRewardNotification = Pick<
    INotification,
    'img' | 'title' | 'subtitle'
>

export const versionData: VersionNotification = {
    title: 'Updates in Hoogii !',
    subtitle: 'Version 0.0.7',
    contents: [
        {
            title: 'Activity: Farming rewords',
            description:
                'Now Hoogii shows Farming rewords in activity! You’ll also get farming rewords reminder by popup and browser notifications.',
        },
        {
            title: 'Browser Notification',
        },
        {
            title: 'Fix error alert that not shows when transaction not be submitted.',
        },
        {
            title: 'Activity: Farming rewords',
            description:
                'Now Hoogii shows Farming rewords in activity! You’ll also get farming rewords reminder by popup and browser notifications.',
        },
        {
            title: 'Browser Notification',
        },
        {
            title: 'Fix error alert that not shows when transaction not be submitted.',
        },
        {
            title: 'Activity: Farming rewords',
            description:
                'Now Hoogii shows Farming rewords in activity! You’ll also get farming rewords reminder by popup and browser notifications.',
        },
        {
            title: 'Browser Notification',
        },
        {
            title: 'Fix error alert that not shows when transaction not be submitted.',
        },
    ],
}

export const rewardData: TxRewardNotification = {
    img: '/images/icons/tx-status-reward.svg',
    title: 'Congratulations!!!',
    subtitle: 'You’ve got farming rewords! Check it in activity!',
}
