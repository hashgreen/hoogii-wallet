import { createMemoryRouter, redirect, RouteObject } from 'react-router-dom'

import { MethodEnum } from '~/types/extension'
import { getStorage } from '~/utils/extension/storage'
import { CreateMnemonic, ImportMnemonic } from '~tabs/pages/mnemonic'
import Password from '~tabs/pages/password'
import Policy from '~tabs/pages/policy'
import Error from '~tabs/pages/status/error'
import Loading from '~tabs/pages/status/loading'
import Success from '~tabs/pages/status/success'
import Welcome from '~tabs/pages/welcome'
import rootStore from '~tabs/store'

import Layout from './layout'

const mnemonicRoutes = {
    path: 'mnemonic',
    children: [
        {
            path: 'create',
            children: [
                {
                    path: 'policy',
                    element: <Policy routeFor="create" />,
                },
                {
                    index: true,
                    element: <CreateMnemonic />,
                },
                {
                    path: 'verify',
                    element: <CreateMnemonic verifying />,
                },
                {
                    path: 'password',
                    element: <Password routeFor="create" />,
                },
                {
                    path: 'loading',
                    action: async () => {
                        try {
                            await rootStore.getMnemonicStore('create').create()
                            return redirect('/mnemonic/success')
                        } catch (error) {
                            throw redirect('/mnemonic/error')
                        }
                    },
                    element: <Loading />,
                },
            ],
        },
        {
            path: 'import',
            children: [
                {
                    path: 'policy',
                    element: <Policy routeFor="import" />,
                },
                {
                    index: true,
                    element: <ImportMnemonic />,
                },
                {
                    path: 'password',
                    element: <Password routeFor="import" />,
                },
                {
                    path: 'loading',
                    action: async () => {
                        try {
                            await rootStore.getMnemonicStore('import').create()
                            return redirect('/mnemonic/success')
                        } catch (error) {
                            throw redirect('/mnemonic/error')
                        }
                    },
                    element: <Loading />,
                },
            ],
        },
        {
            path: 'success',
            element: <Success />,
        },
        {
            path: 'error',
            element: <Error />,
        },
    ],
}

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                index: true,
                loader: async () => {
                    await rootStore.requestData()
                    const { request } = rootStore
                    const keyring = await getStorage('keyring')
                    switch (request?.method) {
                        case MethodEnum.MNEMONIC:
                            if (keyring) window.close()
                            break
                        case MethodEnum.RESET_PASSWORD:
                            throw redirect('/reset')
                        default:
                            break
                    }
                },
                element: <Welcome />,
            },
            mnemonicRoutes,
            {
                path: 'reset',
                children: [
                    {
                        index: true,
                        element: <ImportMnemonic routeFor="reset" />,
                    },
                    {
                        path: 'password',
                        element: <Password routeFor="reset" />,
                    },
                    {
                        path: 'loading',
                        action: async () => {
                            try {
                                await rootStore
                                    .getMnemonicStore('reset')
                                    .create()
                                return redirect(
                                    '/reset/success?description=welcome_back-new_password_description'
                                )
                            } catch (error) {}
                        },
                        element: <Loading />,
                    },
                    {
                        path: 'success',
                        element: <Success />,
                    },
                ],
            },
        ],
    },
]

export default createMemoryRouter(routes)
