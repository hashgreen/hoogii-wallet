import axios from 'axios'

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID
export const GA_API_SECRET = import.meta.env.VITE_GA_API_SECRET
interface MeasurementParams {
    client_id: string // Client ID
    events: { name: string; params?: { [key: string]: any } }[] // Event data
}

// Send a Google Analytics 4 Measurement Protocol request
export async function sendMeasurement(
    params: MeasurementParams
): Promise<void> {
    // Add the Measurement Protocol API secret to the request parameters
    const requestData = {
        ...params,
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
    console.log('response', response)
    // Log an error message if the request fails
    if (response.status !== 200) {
        console.error(
            `Google Analytics Measurement Protocol request failed with status ${response.status}`
        )
    }
}

// Send a pageview event
sendMeasurement({
    client_id: 'CLIENT_ID',
    events: [
        {
            name: 'page_view',
            params: {
                page_location: 'https://www.example.com/path/to/page',
                page_referrer: 'https://www.example.com/referrer',
            },
        },
    ],
})

// Send a custom event
sendMeasurement({
    client_id: 'CLIENT_ID',
    events: [
        {
            name: 'custom_event',
            params: {
                category: 'CATEGORY',
                action: 'ACTION',
                label: 'LABEL',
                value: 1,
            },
        },
    ],
})
