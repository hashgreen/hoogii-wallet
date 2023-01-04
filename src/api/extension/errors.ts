interface Error {
    code: number
    message: string
    data?: any
    error: boolean
}

const defaultError = {
    error: true,
}

export const InvalidParamsError: Error = {
    ...defaultError,
    code: 4000,
    message: 'invalid params',
}

export const UnauthorizedError: Error = {
    ...defaultError,
    code: 4001,
    message: 'unauthorized',
}

export const UserRejectedRequestError: Error = {
    ...defaultError,
    code: 4002,
    message: 'user rejected request',
}

export const SpendableBalanceExceededError: Error = {
    ...defaultError,
    code: 4003,
    message: 'spendable balance exceeded',
}

export const MethodNotFoundError: Error = {
    ...defaultError,
    code: 4004,
    message: 'method not found',
}

export const NoSecretKeyError: Error = {
    ...defaultError,
    code: 4005,
    message: 'no secret key for public key',
}

export const LimitExceedError: Error = {
    ...defaultError,
    code: 4029,
    message: 'too many requests',
}
export const UnderDevelopment: Error = {
    ...defaultError,
    code: 4030,
    message: 'Under development',
}
