import { ToastOptions } from 'react-toastify'

const BLOCKCHAIN_ERROR_MESSAGE = 'Failed to connect to blockchain'
const DATABASE_ERROR_MESSAGE = 'Failed to connect to database'
const API_ERROR_MESSAGE = 'Api error'
const API_TIME_OUT = 'Connection timed out'
export const errorCodes = {
    // BLOCKCHAIN ERROR
    50010: BLOCKCHAIN_ERROR_MESSAGE,
    50011: BLOCKCHAIN_ERROR_MESSAGE,
    50012: BLOCKCHAIN_ERROR_MESSAGE,
    50013: BLOCKCHAIN_ERROR_MESSAGE,
    50014: BLOCKCHAIN_ERROR_MESSAGE,
    50018: BLOCKCHAIN_ERROR_MESSAGE,
    50022: BLOCKCHAIN_ERROR_MESSAGE,
    50023: BLOCKCHAIN_ERROR_MESSAGE,
    50025: BLOCKCHAIN_ERROR_MESSAGE,
    50028: BLOCKCHAIN_ERROR_MESSAGE,
    50029: BLOCKCHAIN_ERROR_MESSAGE,
    // DATABASE ERROR
    50016: DATABASE_ERROR_MESSAGE,
    50015: DATABASE_ERROR_MESSAGE,
    50017: DATABASE_ERROR_MESSAGE,
    50019: DATABASE_ERROR_MESSAGE,
    50020: DATABASE_ERROR_MESSAGE,
    50021: DATABASE_ERROR_MESSAGE,
    50024: DATABASE_ERROR_MESSAGE,
    50026: DATABASE_ERROR_MESSAGE,
    50027: DATABASE_ERROR_MESSAGE,
}

export const getErrorMessage = (errorCode: string | number | undefined) => {
    if (!errorCode) return API_TIME_OUT
    const message = errorCodes[String(errorCodes)] || API_ERROR_MESSAGE

    return `${errorCode} ${message}`
}

export const ToastOption: ToastOptions = {
    position: 'bottom-right',
    autoClose: 2500,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    pauseOnFocusLoss: false,
    style: {
        width: 360,
        marginBottom: 20,
        marginLeft: 20,
        borderRadius: 8,
        minHeight: 30,
    },
}
