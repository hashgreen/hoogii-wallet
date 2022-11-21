import { lazy } from 'react'
import {
    createBrowserRouter,
    createMemoryRouter,
    defer,
    redirect,
    RouteObject,
} from 'react-router-dom'

import Messaging from '~/api/extension/messaging'
import Home from '~/container/Home'
import WelcomeBack from '~/container/Status/WelcomeBack'
import Transfer from '~/container/Transfer/Transfer'
import ClosablePageLayout from '~/layouts/ClosablePage'
import rootStore from '~/store'
import { MethodEnum, SenderEnum } from '~/types/extension'
import { isDev } from '~/utils'

const ImportCAT = lazy(() => import('~/container/ImportCAT/ImportCAT'))

// settings
const Settings = lazy(() => {
    import('~/container/Settings/AddressBook')
    import('~/container/Settings/AddressBook/add')
    import('~/container/Settings/AddressBook/detail')
    import('~/container/Settings/AddressBook/edit')
    import('~/container/Settings/Advance')
    import('~/container/Settings/ConnectedSites')
    return import('~/container/Settings')
})
const AddressBook = lazy(() => import('~/container/Settings/AddressBook'))
const AddAddressBook = lazy(
    () => import('~/container/Settings/AddressBook/add')
)
const AddressBookDetail = lazy(
    () => import('~/container/Settings/AddressBook/detail')
)
const EditAddressBook = lazy(
    () => import('~/container/Settings/AddressBook/edit')
)
const Advance = lazy(() => import('~/container/Settings/Advance'))
const Feedback = lazy(() => import('~/container/Settings/Advance/feedback'))
const ConnectedSites = lazy(() => import('~/container/Settings/ConnectedSites'))
const Network = lazy(() => import('~/container/Network'))

const redirectIfWithoutMnemonicOrLocked = async () => {
    const { seed, locked } = await rootStore.walletStore.init()

    if (!seed) {
        Messaging.toBackground<MethodEnum.MNEMONIC>({
            sender: SenderEnum.EXTENSION,
            origin: chrome.runtime.getURL(''),
            method: MethodEnum.MNEMONIC,
        })
        window.close()
        return
    }
    if (locked) throw redirect('/locked')
    await rootStore.walletStore.generateAddress(seed)
}

const settingRoutes = {
    path: 'setting',
    children: [
        {
            index: true,
            element: <Settings />,
        },
        {
            path: 'addressBook',
            children: [
                {
                    index: true,
                    element: <AddressBook />,
                },
                {
                    path: 'add',
                    element: <AddAddressBook />,
                },
                {
                    path: 'detail/:id',
                    children: [
                        {
                            index: true,
                            element: <AddressBookDetail />,
                        },
                        {
                            path: 'edit',
                            element: <EditAddressBook />,
                        },
                    ],
                },
            ],
        },
        {
            path: 'advance',
            children: [
                {
                    index: true,
                    element: <Advance />,
                },
                {
                    path: 'feedback',
                    element: <Feedback />,
                },
            ],
        },
        ...(isDev
            ? [
                  {
                      path: 'connectedSites',
                      element: <ConnectedSites />,
                  },
              ]
            : []),
    ],
}

export const routes: RouteObject[] = [
    {
        index: true,
        loader: async () => {
            await redirectIfWithoutMnemonicOrLocked()
            await rootStore.assetsStore.retrieveExistedAssets()
            const balances = rootStore.assetsStore.getAllBalances()
            return defer({ balances })
        },
        element: <Home />,
    },
    {
        path: 'activity',
        loader: async () => {
            await redirectIfWithoutMnemonicOrLocked()
            const xchBalance = rootStore.assetsStore.getXCHBalance()
            return defer({ xchBalance })
        },
        element: <Home initialTab={1} />,
    },
    {
        loader: redirectIfWithoutMnemonicOrLocked,
        element: <ClosablePageLayout />,
        children: [
            {
                path: 'importCAT',
                element: <ImportCAT />,
            },
            {
                path: 'transfer',
                element: <Transfer />,
            },
            settingRoutes,
            ...(isDev ? [{ path: 'network', element: <Network /> }] : []),
        ],
    },
    {
        path: '/',
        loader: async () => {
            const { locked = true } = await rootStore.walletStore.init()
            if (!locked) throw redirect('/')
        },
        children: [
            {
                path: 'locked',
                element: <WelcomeBack />,
            },
        ],
    },
]

export const memoryRouter = createMemoryRouter(routes)
export const browserRouter = createBrowserRouter(routes)
