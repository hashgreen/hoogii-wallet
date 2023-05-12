import { InternalControllerStore } from '~/popup/controller'
import {
    IMessage,
    MethodDataType,
    MethodEnum,
    RequestMethodEnum,
} from '~/types/extension'

export interface IRequestPopupPageProps<T extends RequestMethodEnum> {
    request: IMessage<MethodDataType<MethodEnum.REQUEST, T>>
    controller: InternalControllerStore
}
