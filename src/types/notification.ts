interface IContnet {
    title: string
    description?: string
}

export interface INotification {
    img?: string
    version?: string
    title: string
    subtitle: string
    contents?: IContnet[]
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

export const rewardData: TxRewardNotification = {
    img: '/images/icons/tx-status-reward.svg',
    title: 'Congratulations!!!',
    subtitle: 'You’ve got farming rewords! Check it in activity!',
}
