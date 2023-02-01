import { AxiosError } from 'axios'
import { Slide, toast, ToastOptions } from 'react-toastify'

import { isDev } from '~/utils'

const API_ERROR_MESSAGE = 'Api error'
const API_TIME_OUT = 'Connection timed out'

export const getErrorMessage = (error: AxiosError) => {
    const errorKey = error?.response?.data?.code
    const message = error?.response?.data?.msg
    // use backend error code
    if (errorKey && message) {
        return `${errorKey} ${message}`
    }

    if (error?.response?.status) {
        return `${error?.response?.status} ${message || API_ERROR_MESSAGE}`
    }
    if (error.message) {
        return `${error.message}`
    }
    // if (isDev) {
    //     console.log(error) // log the error reason for debug
    // }

    return API_TIME_OUT
}
export const ToastOption: ToastOptions = {
    autoClose: 2500,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    pauseOnFocusLoss: false,
    transition: Slide,
    position: toast.POSITION.BOTTOM_CENTER,
    style: {
        width: 360,
        marginBottom: 20,
        marginLeft: 20,
        borderRadius: 4,
        minHeight: 30,
    },
}
