import { PopupEnum } from '~/types/extension'

import {
    calcPopupPosition,
    closeTabs,
    createWindow,
    getTabs,
    getUrl,
    updateTab,
} from '.'

export const createPopup = async (
    popup: PopupEnum,
    newTab: boolean = false
) => {
    const url = getUrl(`/${popup}.html`) as `/${string}`
    if (newTab) {
        const { tab } = await createWindow(url, 'popup', {
            ...(await calcPopupPosition()),
        })
        return tab
    }
    const tabs = await getTabs(url)
    if (tabs.length) {
        tabs[0].url !== url && (await updateTab(tabs[0], { url, active: true }))
        await closeTabs(tabs.slice(1))
        return tabs[0]
    } else {
        return await createPopup(popup, true)
    }
}
