import { ChainEnum } from '@hashgreen/hg-models'
import { endpoints as jarvanEndpoints } from '@hashgreen/hg-query/jarvan'
import { endpoints as threshEndpoints } from '@hashgreen/hg-query/thresh'

export interface IApiEndpointSet {
    jarvan: string
    thresh: string
}
export type apiEndpointName = keyof IApiEndpointSet

export const apiEndpointSets: {
    [key in ChainEnum]?: IApiEndpointSet
} = {
    [ChainEnum.Mainnet]: {
        jarvan: jarvanEndpoints[ChainEnum.Mainnet],
        thresh: threshEndpoints[ChainEnum.Mainnet],
    },
}
