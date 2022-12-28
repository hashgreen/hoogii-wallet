import { MethodEnum } from '~/types/extension'
export const permission = {
    Authenticate: {
        [MethodEnum.LOCK]: MethodEnum.LOCK,
        [MethodEnum.UNLOCK]: MethodEnum.UNLOCK,
    },
}
