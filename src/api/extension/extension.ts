import { POPUP_WINDOW, PopupEnum } from '~/types/extension'
export const createPopup = async (popup: PopupEnum) => {
    let left = 0
    let top = 0
    try {
        const lastFocused = await new Promise<chrome.windows.Window>(
            (resolve) => {
                chrome.windows.getLastFocused((windowObject) => {
                    return resolve(windowObject)
                })
            }
        )
        top = lastFocused.top ?? 0
        left =
            lastFocused.left ??
            0 + Math.round((lastFocused.width ?? 0 - POPUP_WINDOW.width) / 2)
    } catch (_) {
        // The following properties are more than likely 0, due to being
        // opened from the background chrome process for the extension that
        // has no physical dimensions
        const { screenX, screenY, outerWidth } = window
        top = Math.max(screenY, 0)
        left = Math.max(screenX + (outerWidth - POPUP_WINDOW.width), 0)
    }

    const { popupWindow, tab } = await new Promise<{
        popupWindow?: chrome.windows.Window
        tab: chrome.tabs.Tab
    }>((resolve) =>
        chrome.tabs.create(
            {
                url: chrome.runtime.getURL(popup + '.html'),
                active: false,
            },
            function (tab) {
                chrome.windows.create(
                    {
                        tabId: tab.id,
                        type: 'popup',
                        focused: true,
                        ...POPUP_WINDOW,
                        left,
                        top,
                    },
                    function (newWindow) {
                        return resolve({ popupWindow: newWindow, tab })
                    }
                )
            }
        )
    )

    if (popupWindow?.left !== left && popupWindow?.state !== 'fullscreen') {
        await new Promise((resolve) => {
            if (popupWindow?.id) {
                chrome.windows.update(popupWindow.id, { left, top }, () => {
                    return resolve({})
                })
            }
        })
    }
    return tab
}

export const createTab = async (
    createProperties: chrome.tabs.CreateProperties,
    newTab = false
) => {
    const url = createProperties.url
        ? chrome.runtime.getURL(createProperties.url)
        : undefined
    const tabs = await new Promise<chrome.tabs.Tab[]>((resolve) => {
        chrome.tabs.query({ url }, (tabs) => resolve(tabs))
    })

    const tabId = tabs[0]?.id
    if (tabId === undefined || newTab) {
        return new Promise<chrome.tabs.Tab>((resolve) => {
            chrome.tabs.create(
                {
                    ...createProperties,
                    url,
                },
                (tab) => resolve(tab)
            )
        })
    } else {
        return new Promise<chrome.tabs.Tab>((resolve) => {
            chrome.tabs.update(tabId, { active: true }, async (tab) =>
                resolve(tab ?? (await createTab(createProperties, true)))
            )
        })
    }
}
