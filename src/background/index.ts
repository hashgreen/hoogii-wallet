import { createPopup, createTab } from '~/api/extension/extension'
import Messaging, { BackgroundController } from '~/api/extension/messaging'
import connectedSitesStore from '~/store/ConnectedSitesStore'
import { MethodEnum, PopupEnum, SenderEnum } from '~/types/extension'
import { getStorage } from '~/utils/extension/storage'
const controller = new BackgroundController()

controller.add(MethodEnum.IS_VALID_WALLET, async (request, sendResponse) => {
    const keyring = await getStorage<string>('keyring')
    if (!keyring) {
        sendResponse({
            ...request,
            data: {
                error: true,
                code: 401,
                message: 'Please create a wallet first',
            },
            sender: SenderEnum.EXTENSION,
            target: SenderEnum.WEBPAGE,
        })
    } else {
        sendResponse({
            ...request,
            sender: SenderEnum.EXTENSION,
            target: SenderEnum.WEBPAGE,
        })
    }
})
controller.add(MethodEnum.ENABLE, async (request, sendResponse) => {
    if (connectedSitesStore.isConnectedSite(request.origin)) {
        sendResponse({
            ...request,
            data: true,
            sender: SenderEnum.EXTENSION,
            target: SenderEnum.WEBPAGE,
        })
    } else {
        let data = false
        try {
            const tab = await createPopup(PopupEnum.INTERNAL)
            await Messaging.toInternal<MethodEnum.ENABLE>(tab, request)
            data = true
        } catch (error) {
            console.warn(error)
        }
        sendResponse({
            ...request,
            data,
            sender: SenderEnum.EXTENSION,
            target: SenderEnum.WEBPAGE,
        })
    }
})

controller.add(MethodEnum.LOCK, async (request, sendResponse) => {
    controller.password = ''

    sendResponse({
        ...request,
        data: { success: true },
        sender: SenderEnum.EXTENSION,
        target: SenderEnum.WEBPAGE,
    })
})

controller.add(MethodEnum.UNLOCK, async (request, sendResponse) => {
    try {
        const tab = await createPopup(PopupEnum.INTERNAL)
        await Messaging.toInternal<MethodEnum.UNLOCK>(tab, request)

        sendResponse({
            ...request,
            data: { success: true },
            sender: SenderEnum.EXTENSION,
            target: SenderEnum.WEBPAGE,
        })
    } catch (error) {}
})
controller.add(MethodEnum.SAVE_DATA, async (request, sendResponse) => {
    controller.password = request.data?.password || ''
    sendResponse({
        ...request,
        data: undefined,
        sender: SenderEnum.EXTENSION,
        target: SenderEnum.WEBPAGE,
    })
})
controller.add(MethodEnum.REQUEST_DATA, async (request, sendResponse) => {
    sendResponse({
        ...request,
        data: { [request.data?.key]: controller?.[request.data?.key] },
        sender: SenderEnum.EXTENSION,
        target: SenderEnum.WEBPAGE,
    })
})
controller.add(MethodEnum.IS_CONNECTED, async (request, sendResponse) => {
    sendResponse({
        ...request,
        data: connectedSitesStore.isConnectedSite(request.origin),
        sender: SenderEnum.EXTENSION,
        target: SenderEnum.WEBPAGE,
    })
})
controller.add(MethodEnum.REFUSE, async (request, sendResponse) => {
    try {
        const tab = await createPopup(PopupEnum.INTERNAL)
        await Messaging.toInternal<MethodEnum.REFUSE>(tab, request)
    } catch (error) {
        console.warn(error)
    }
    sendResponse({
        ...request,
        sender: SenderEnum.EXTENSION,
        target: SenderEnum.WEBPAGE,
    })
})

controller.add(MethodEnum.MNEMONIC, async (request) => {
    try {
        const tab = await createTab(
            {
                url: 'tabs.html',
            },
            true
        )
        await Messaging.toInternal<MethodEnum.MNEMONIC>(tab, request)
    } catch (error) {}
})

controller.add(MethodEnum.RESET_PASSWORD, async (request) => {
    try {
        const tab = await createTab(
            {
                url: 'tabs.html',
            },
            true
        )
        await Messaging.toInternal<MethodEnum.RESET_PASSWORD>(tab, request)
    } catch (error) {}
})

controller.add(MethodEnum.IS_LOCK, async (request, sendResponse) => {
    const mnemonic = await getStorage<string>('mnemonic')
    const password = controller?.password
    const isLocked = !password && !mnemonic

    sendResponse({
        ...request,
        data: isLocked,
        sender: SenderEnum.EXTENSION,
        target: SenderEnum.WEBPAGE,
    })
})

controller.add(MethodEnum.REQUEST, async (request, sendResponse) => {
    if (!request?.isConnected || request?.isLocked) {
        const tab = await createPopup(PopupEnum.INTERNAL)
        await Messaging.toInternal<MethodEnum.REQUEST>(tab, request)
        sendResponse({
            ...request,
            sender: SenderEnum.EXTENSION,
            target: SenderEnum.WEBPAGE,
        })
    } else {
        sendResponse({
            ...request,
            data: {
                error: true,
                code: 401,
                message: 'Under development',
            },
            sender: SenderEnum.EXTENSION,
            target: SenderEnum.WEBPAGE,
        })
    }
})

controller.listen()
