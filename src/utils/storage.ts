import { chains } from '~/utils/constants'
import { isExtension } from '~/utils/env'

export const setStorage = async <T extends { [key: string]: any } = any>(
    item: T
): Promise<void> => {
    if (isExtension) {
        const { setStorage } = await import('./extension/storage')
        await setStorage(item)
    } else {
        Object.entries(item).forEach(([key, value]) => {
            localStorage.setItem(key, JSON.stringify(value))
        })
    }
}

export const getStorage = async <
    T extends any = any,
    K extends string = string
>(
    key: K
): Promise<T | undefined> => {
    if (isExtension) {
        const { getStorage } = await import('./extension/storage')
        return await getStorage(key)
    } else {
        try {
            const data = localStorage.getItem(key)
            if (data) {
                try {
                    return JSON.parse(data)
                } catch (error) {
                    return data as T
                }
            }
        } catch (error) {}
    }
}

export const removeItemsFromStorage = async (keys: string[]): Promise<void> => {
    if (isExtension) {
        const { removeItemsFromStorage } = await import('./extension/storage')
        await removeItemsFromStorage(keys)
    } else {
        keys.forEach((key) => {
            localStorage.removeItem(key)
        })
    }
}

export const clearStorage = async (): Promise<void> => {
    if (isExtension) {
        const { clearStorage } = await import('./extension/storage')
        await clearStorage()
    } else {
        localStorage.clear()
    }
}
export const retrieveChain = async () => {
    const chainId = (await getStorage<string>('chainId')) as string
    const chain = chains[chainId] || chains[1]
    return chain
}
