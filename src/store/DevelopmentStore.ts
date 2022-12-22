import { makeAutoObservable, runInAction } from 'mobx'

import { IApiEndpointSet } from '~/types/chia'
import { getStorage, setStorage } from '~/utils/storage'

type DevelopmentOptions = {
    enable: boolean
} & Partial<IApiEndpointSet>

class DevelopmentStore {
    isEnable: boolean = false
    apiEndpoints?: Partial<IApiEndpointSet>
    constructor() {
        makeAutoObservable(this)
        this.refresh()
    }

    refresh = async () => {
        const options = await getStorage<DevelopmentOptions>('development')
        const apiEndpoints = Object.fromEntries(
            [
                options?.jarvan && ['jarvan', options.jarvan],
                options?.zed && ['zed', options.zed],
            ].filter(Boolean) as [string, string][]
        )
        runInAction(() => {
            this.isEnable = Boolean(options?.enable)
            if (this.isEnable) {
                this.apiEndpoints = apiEndpoints
            }
        })
    }

    updateApiEndpoints = async (apiEndpoints: Partial<IApiEndpointSet>) => {
        if (this.isEnable) {
            await setStorage({
                development: { enable: this.isEnable, ...apiEndpoints },
            })
            runInAction(() => {
                this.apiEndpoints = apiEndpoints
            })
        }
    }
}

export default new DevelopmentStore()
