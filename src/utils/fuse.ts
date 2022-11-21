import Fuse from 'fuse.js'

import { IAsset } from '~/db'

export function fuseOptions<T = IAsset>(keys: (keyof T)[]) {
    return {
        includeScore: true,
        threshold: 0.1,
        keys,
        fieldNormWeight: 1,
    }
}

export function search<T = IAsset>(query, assets, options) {
    const fuse = new Fuse<T>(assets, options)
    const searchExpressions = {
        $and: query
            .split(' ')
            .filter((e) => e.length > 0)
            .map((e) => ({
                $or: options.keys?.map((key) => ({
                    [key as string]: e,
                })),
            })),
    }
    return (
        query
            ? fuse
                  .search(searchExpressions)
                  .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
                  .map((e) => e.item)
            : assets
    ) as T[]
}
