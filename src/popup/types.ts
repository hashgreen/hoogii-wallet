import {
    IMessage,
    MethodDataType,
    MethodEnum,
    RequestMethodEnum,
} from '~/types/extension'

import { InternalControllerStore } from './controller'

export interface IPopupPageProps<
    T extends MethodEnum,
    S extends RequestMethodEnum | undefined = undefined
> {
    request: IMessage<MethodDataType<T, S>>
    controller: InternalControllerStore
}
