import Messaging from '~/api/extension/messaging'
import rootStore from '~/store'
import connectedSitesStore from '~/store/ConnectedSitesStore'
import { EventEnum, MethodEnum, SenderEnum } from '~/types/extension'
import { bcryptHash } from '~/utils'
import { setStorage } from '~/utils/extension/storage'
const idlePeriod = 15 * 60

chrome.idle.setDetectionInterval(idlePeriod)
chrome.idle.onStateChanged.addListener(async (newState) => {
    if (newState === 'idle') {
        console.debug('idle detected, locking wallet')
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
export const switchChainToEventListener = async (chainId: string) => {
    chrome.tabs.query({}, async (tabs) => {
        const connectedSites = await connectedSitesStore.getConnectedSite()
        tabs.forEach((tab) => {
            if (tab?.id && tab?.url) {
                const url = new URL(tab?.url)
                if (connectedSites.some((site) => site.url === url.origin)) {
                    console.debug('send event url.origin', url.origin)
                    chrome.tabs.sendMessage(tab.id, {
                        data: chainId,
                        target: SenderEnum.WEBPAGE,
                        sender: SenderEnum.EXTENSION,
                        event: EventEnum.CHAIN_CHANGED,
                        origin: url.origin,
                    })
                }
            }
        })
    })
}
