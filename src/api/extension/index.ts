import Messaging from '~/api/extension/messaging'
import rootStore from '~/store'
import { MethodEnum, SenderEnum } from '~/types/extension'
import { bcryptHash } from '~/utils'
import { setStorage } from '~/utils/storage'
const idlePeriod = import.meta.env.VITE_LOCK_AFTER * 60 * 1000
chrome.idle.setDetectionInterval(idlePeriod)
chrome.idle.onStateChanged.addListener(async (newState) => {
    if (newState === 'idle') {
        rootStore.walletStore.lock()
    }
})
export const lock = async () => {
    Messaging.toBackground({
        sender: SenderEnum.EXTENSION,
        method: MethodEnum.LOCK,
    })
}

export const savePassword = async (password): Promise<void> => {
    const passwordHash = await bcryptHash(password)
    await setStorage({ password: passwordHash })

    Messaging.toBackground({
        sender: SenderEnum.EXTENSION,
        method: MethodEnum.SAVE_DATA,
        origin: window.origin,
        data: { password },
    })
}
export const getDataFromMemory = async <T = string | number>(
    key: string
): Promise<T> => {
    const res = await Messaging.toBackground({
        sender: SenderEnum.EXTENSION,
        method: MethodEnum.REQUEST_DATA,
        origin: window.origin,
        data: { key },
    })

    return res.data?.[key]
}
