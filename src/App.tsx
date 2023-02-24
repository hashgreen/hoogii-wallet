import { configureAbly } from '@ably-labs/react-hooks'
import { observer } from 'mobx-react-lite'
import { Suspense, useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import { callGetAblyAccessToken } from '~/api/api'
import LoadingComponent from '~/components/Loading'
import { memoryRouter } from '~/router'
import rootStore from '~/store'
import { apiEndpointSets } from '~/utils/constants'
import { getStorage } from '~/utils/extension/storage'
const App = () => {
    const {
        walletStore: { puzzleHash },
    } = rootStore

    useEffect(() => {
        document.documentElement.classList.add('dark')
        // TODO: support dark/light switch
        // getStorage('theme').then((theme) => {
        //     if (
        //         theme === 'dark' ||
        //         (!theme &&
        //             window.matchMedia('(prefers-color-scheme: dark)').matches)
        //     ) {
        //         document.documentElement.classList.add('dark')
        //     } else {
        //         document.documentElement.classList.remove('dark')
        //     }
        // })
    }, [])

    useEffect(() => {
        ;(async () => {
            if (puzzleHash) {
                try {
                    const chainId: string = await getStorage<string>('chainId')

                    configureAbly({
                        authUrl: `${
                            apiEndpointSets[chainId || '0x01'].jarvan
                        }/auth`,
                        authCallback: async (data, callback) => {
                            const formData = new FormData()
                            formData.append('puzzle_hash', '0x' + puzzleHash)
                            const tokenData = await callGetAblyAccessToken(
                                formData
                            )
                            const ablyToken = tokenData.data.data.token
                            // eslint-disable-next-line n/no-callback-literal
                            callback('', ablyToken)
                        },
                    })
                    rootStore.walletStore.isAblyConnected = true
                } catch (e) {
                    console.log('e>>', e)
                }
            }
        })()
    }, [puzzleHash])

    return (
        <Suspense fallback={<div className="full bg-main" />}>
            <RouterProvider
                router={memoryRouter}
                fallbackElement={<LoadingComponent className="bg-main" />}
            />
            <ToastContainer />
        </Suspense>
    )
}

export default observer(App)
