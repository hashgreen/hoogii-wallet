import { UrlType } from '.'

export const createWindow = async (
    url: UrlType,
    type: chrome.windows.createTypeEnum = 'popup',
    params?: Omit<chrome.windows.CreateData, 'type' | 'url'>
) => {
    const window = await chrome.windows.create({ url, type, ...params })
    return { window, tab: window.tabs![0] }
}
