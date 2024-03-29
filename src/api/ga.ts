import axios from 'axios'

import rootStore from '~/store'
import { ActionEnum, CategoryEnum, EventEnum } from '~/types/ga'
import { StorageEnum } from '~/types/storage'
import { add0x } from '~/utils/encryption'
import { isDev } from '~/utils/env'
import { getStorage } from '~/utils/extension/storage'

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID
export const GA_API_SECRET = import.meta.env.VITE_GA_API_SECRET

interface IEventParams {
    category?: keyof typeof CategoryEnum
    action?: keyof typeof ActionEnum
    engagement_time_msec?: number
    value?: any
}
interface IEvent {
    name: keyof typeof EventEnum
    params: IEventParams
}

interface IMeasurementParams {
    client_id?: string // Client ID
    events: IEvent[] // Event data
}

// Send a Google Analytics 4 Measurement Protocol request
export async function sendMeasurement(
    params: IMeasurementParams
): Promise<void> {
    if (!isDev) {
        // Add the Measurement Protocol API secret to the request parameters
        const chainId = await getStorage<string>(StorageEnum.chainId)
        const {
            walletStore: { puzzleHash },
        } = rootStore

        const clientId =
            puzzleHash || (await getStorage<string>(StorageEnum.puzzleHash))

        const requestData = {
            ...params,
            client_id: add0x(clientId),
            // add the chain id to each event's params
            events: params.events.map((event) => {
                return {
                    name: event.name,
                    params: {
                        ...event.params,
                        engagement_time_msec: 1,
                        chain_id: 'chain-' + chainId,
                    },
                }
            }),
            // api_secret: GA_API_SECRET,
        }

        // Send the request using Axios
        await axios.post(
            `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&&api_secret=${GA_API_SECRET}`,
            requestData,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )
    }
}
// Demo:
// Send a pageview event
// sendMeasurement({
//     client_id: 'CLIENT_ID',
//     events: [
//         {
//             name: 'page_view',
//             params: {
//                 page_location: 'https://www.example.com/path/to/page',
//                 page_referrer: 'https://www.example.com/referrer',
//             },
//         },
//     ],
// })

// Send a custom event
// sendMeasurement({
//     client_id: 'CLIENT_ID',
//     events: [
//         {
//             name: 'custom_event',
//             params: {
//                 category: 'CATEGORY',
//                 action: 'ACTION',
//                 label: 'LABEL',
//                 value: 1,
//             },
//         },
//     ],
// })
