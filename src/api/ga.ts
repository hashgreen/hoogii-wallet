import axios from 'axios'

import rootStore from '~/store'
import { ActionEnum, CategoryEnum, EventEnum } from '~/types/ga'
import { StorageEnum } from '~/types/storage'
import { getStorage } from '~/utils/extension/storage'

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID
export const GA_API_SECRET = import.meta.env.VITE_GA_API_SECRET

interface IEventParams {
    category: CategoryEnum
    action: ActionEnum
    value?: any
}
interface IEvent {
    name: EventEnum
    params?: IEventParams
}

interface IMeasurementParams {
    client_id?: string // Client ID
    events: IEvent[] // Event data
}

// Send a Google Analytics 4 Measurement Protocol request
export async function sendMeasurement(
    params: IMeasurementParams
): Promise<void> {
    // Add the Measurement Protocol API secret to the request parameters
    const chainId = await getStorage<string>(StorageEnum.chainId)
    const {
        walletStore: { puzzleHash },
    } = rootStore

    const requestData = {
        ...params,
        client_id: puzzleHash,
        // add the chain id to each event's params
        events: params.events.map((event) => {
            return {
                name: event.name,
                params: {
                    ...event.params,
                    chain_id: 'chain-' + chainId,
                },
            }
        }),
        // api_secret: GA_API_SECRET,
    }

    // Send the request using Axios
    const response = await axios.post(
        `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&&api_secret=${GA_API_SECRET}`,
        requestData,
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    )
    console.log('ga res:', response)
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
