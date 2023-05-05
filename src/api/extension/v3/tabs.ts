import { getUrl, UrlType } from '.'

export const createTab = async (
    url: UrlType,
    params?: Omit<chrome.tabs.CreateProperties, 'url'>
) => {
    const tab = await chrome.tabs.create({
        url: getUrl(url),
        ...params,
    })

    return tab
}

export const getTabs = async (
    url: UrlType,
    params?: Omit<chrome.tabs.QueryInfo, 'url'>
) => {
    const tabs = await chrome.tabs.query({ url: getUrl(url), ...params })
    return tabs
}

export const updateTab = async (
    tab: chrome.tabs.Tab,
    params: chrome.tabs.UpdateProperties
) => {
    if (!tab?.id) return
    await chrome.tabs.update(tab.id, params)
}

export const closeTabs = async (tabs: chrome.tabs.Tab[]) => {
    await chrome.tabs.remove(
        tabs.map((tab) => tab.id).filter(Number) as number[]
    )
}
