import { MethodEnum, RequestMethodEnum } from '~/types/extension'
export const permission = {
    Authenticate: {
        [MethodEnum.LOCK]: MethodEnum.LOCK,
        [MethodEnum.UNLOCK]: MethodEnum.UNLOCK,
    },
    Confirm: {
        [RequestMethodEnum.WALLET_SWITCH_CHAIN]:
            RequestMethodEnum.WALLET_SWITCH_CHAIN,
        [RequestMethodEnum.CREATE_OFFER]: RequestMethodEnum.CREATE_OFFER,
        [RequestMethodEnum.TAKE_OFFER]: RequestMethodEnum.TAKE_OFFER,
    },
}
