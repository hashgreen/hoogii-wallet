import { MethodEnum, RequestMethodEnum } from '~/types/extension'
export const permission = {
    Authenticate: {
        [MethodEnum.LOCK]: MethodEnum.LOCK,
        [MethodEnum.UNLOCK]: MethodEnum.UNLOCK,
    },
    DoubleCheck: {
        [RequestMethodEnum.WALLET_SWITCH_CHAIN]:
            RequestMethodEnum.WALLET_SWITCH_CHAIN,
    },
}
