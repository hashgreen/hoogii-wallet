import { IPopupPageProps } from '~/popup/types'
import { MethodEnum, RequestMethodEnum } from '~/types/extension'

const CreateOffer = ({
    controller,
    request,
}: IPopupPageProps<MethodEnum.REQUEST, RequestMethodEnum.CREATE_OFFER>) => {
    const { data: { params } = {} } = request
}

export default CreateOffer
