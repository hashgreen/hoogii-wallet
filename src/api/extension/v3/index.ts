import { POPUP_WINDOW } from '~/types/extension'

export type UrlType = `/${string}` | `http://${string}` | `https://${string}`

export const getUrl = (url: UrlType) => {
    if (url.startsWith('/')) {
        return chrome.runtime.getURL(url)
    }
    return url
}

export const calcPopupPosition = async ({
    width = POPUP_WINDOW.width,
    height = POPUP_WINDOW.height,
}: {
    width?: number
    height?: number
} = {}) => {
    try {
        const lastFocused = await chrome.windows.getLastFocused()
        return {
            width,
            height,
            left: Math.max(
                Math.round(
                    (lastFocused.left ?? 0) +
                        (lastFocused.width ?? 0) / 2 -
                        width / 2
                ),
                0
            ),
            top: Math.max(
                Math.round(
                    (lastFocused.top ?? 0) +
                        (lastFocused.height ?? 0) / 2 -
                        height / 2
                ),
                0
            ),
        }
    } catch (error) {
        // The following properties are more than likely 0, due to being
        // opened from the background chrome process for the extension that
        // has no physical dimensions
        const { screenX, screenY, outerWidth } = window
        const top = Math.max(screenY, 0)
        const left = Math.max(screenX + (outerWidth - width), 0)
        return {
            width,
            height,
            left,
            top,
        }
    }
}

export * from './tabs'
export * from './windows'
