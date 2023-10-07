import Messaging from '~/api/extension/messaging'
import { MethodEnum, RequestMethodEnum, SenderEnum } from '~/types/extension'

export const createMockRequest = (
    method: RequestMethodEnum,
    params: any,
    isConnected: boolean = true
) => {
    const favicon = document.querySelector(
        'link[rel~="icon"]'
    ) as HTMLLinkElement
    const iconUrl = favicon?.href ?? '/favicon.ico'
    const origin = window.origin
    Messaging.toBackground<MethodEnum.REQUEST>({
        method: MethodEnum.REQUEST,
        sender: SenderEnum.EXTENSION,
        data: {
            method,
            params,
        },
        origin,
        iconUrl,
        isLocked: false,
        isConnected,
    })
}
export const createMockTransfer = () =>
    createMockRequest(RequestMethodEnum.TRANSFER, {
        to: 'txch1x4sk0pflmyawh4j9een8caz42d4ms3580tyhvfndt5475qnzreysuu594n',
        amount: '100000000',
    })
export const createMockOffer = () =>
    createMockRequest(RequestMethodEnum.CREATE_OFFER, {
        offerAssets: [
            {
                assetId:
                    '73dd418ff67e6079f06c7cc8cee637c7adc314210dca26997d634692f6c16087',
                amount: '1000',
            },
            {
                assetId:
                    'a3637b4da9d3e0e16b85bffd9c2632cb05d889330823310228916f2d72ac1a4c',
                amount: '1000000',
            },
        ],
        requestAssets: [
            {
                assetId: '',
                amount: '10000000',
            },
        ],
        fee: '10000000',
    })
