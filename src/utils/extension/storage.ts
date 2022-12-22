import { getBucket } from '@extend-chrome/storage'

export const setStorage = async <T extends { [key: string]: any } = any>(
    item: T
): Promise<void> => {
    const bucket = getBucket('store', 'local')
    await bucket.set(item)
}

export const getStorage = async <
    T extends any = any,
    K extends string = string
>(
    key: K
): Promise<T> => {
    const bucket = getBucket('store', 'local')
    return (await bucket.get(key))[key]
}

export const removeItemsFromStorage = async (keys: string[]): Promise<void> => {
    const bucket = getBucket('store', 'local')

    await bucket.remove(keys)
}

export const clearStorage = async (): Promise<void> => {
    const bucket = getBucket('store', 'local')

    await bucket.clear()
}
