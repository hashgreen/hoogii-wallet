import { makeAutoObservable } from 'mobx'

import { chains } from '~/utils/constants'
import { seedToAddress } from '~/utils/signature'
class RequestStore {
    constructor() {
        makeAutoObservable(this)
    }

    async getAddress(seed: Uint8Array, chainId: string): Promise<string> {
        const chain = chains.find((chain) => chain.id === chainId)
        if (chain && seed) {
            return seedToAddress(seed, chain?.prefix ?? 'txch')
        }

        return ''
    }
}

const store = new RequestStore()

export default store
