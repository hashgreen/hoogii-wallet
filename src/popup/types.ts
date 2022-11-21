import { IMessage, MethodDataType, MethodEnum } from '~/types/extension'

import { InternalControllerStore } from './controller'

export interface IPopupPageProps<T extends MethodEnum> {
    request: IMessage<MethodDataType<T>>
    controller: InternalControllerStore
}
