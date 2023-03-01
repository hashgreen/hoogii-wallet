import axios from 'axios'

export const GA_TRACKING_ID = 'G-GMGV923KNB'
export const GA_API_KEY = '0S5Sd7crT6mV0nvBW7nBwg'

interface MeasurementParams {
    v: string // Version
    t: string // Event Type
    tid: string // Tracking ID
    cid: string // Client ID
    dp?: string // Document Path
    dr?: string // Document Referrer
    ea?: string // Event Action
    ec?: string // Event Category
    el?: string // Event Label
    ev?: number // Event Value
}

// Send a Google Analytics Measurement Protocol request
export async function sendMeasurement(
    params: MeasurementParams
): Promise<void> {
    // Add the Measurement Protocol API key to the request parameters
    const requestData = {
        ...params,
        api_secret: GA_API_KEY,
    }

    // Serialize the request parameters as a URL-encoded string
    const requestDataString = Object.entries(requestData)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')

    // Send the request using Axios
    const response = await axios.post(
        'https://www.google-analytics.com/collect',
        requestDataString,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
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
    v: '1',
    t: 'pageview',
    tid: GA_TRACKING_ID,
    cid: 'CLIENT_ID',
    dp: '/path/to/page',
    dr: 'http://referrer.com',
})

// Send a custom event
sendMeasurement({
    v: '1',
    t: 'event',
    tid: GA_TRACKING_ID,
    cid: 'CLIENT_ID',
    ec: 'category',
    ea: 'action',
    el: 'label',
    ev: 1,
})
