import Messaging from '~/api/extension/messaging'
import rootStore from '~/store'
import { MethodEnum, SenderEnum } from '~/types/extension'
import { bcryptHash } from '~/utils'
import { setStorage } from '~/utils/storage'
const idlePeriod = 15 * 60

chrome.idle.setDetectionInterval(idlePeriod)
chrome.idle.onStateChanged.addListener(async (newState) => {
    if (newState === 'idle') {
        console.log('idle detected, locking wallet')
        rootStore.walletStore.lock()
    }
})
export const lockFromBackground = async () => {
    await Messaging.toBackground({
        sender: SenderEnum.EXTENSION,
        method: MethodEnum.LOCK,
    })
}

export const savePassword = async (password): Promise<void> => {
    const passwordHash = await bcryptHash(password)
    await setStorage({ password: passwordHash })
    await chrome.storage.session.set({ password })
}
export const getDataFromMemory = async (key: string): Promise<any> => {
    return (await chrome.storage.session.get(key))?.[key]
}
