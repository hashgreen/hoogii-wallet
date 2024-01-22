import { Slide, toast, ToastOptions } from 'react-toastify'

const API_ERROR_MESSAGE = 'Api error'
const API_TIME_OUT = 'Connection timed out'

export const getErrorMessage = (error: Error) => {
    const errorKey = error.message
    const message = error.stack || API_ERROR_MESSAGE
    // use backend error code
    if (errorKey && message) {
        return `${errorKey} ${message}`
    }

    if (error.message) {
        return `${error.message}`
    }

    return API_TIME_OUT
}
export const toastOption: ToastOptions = {
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
