import { observer } from 'mobx-react-lite'
import { Suspense, useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import LoadingComponent from '~/components/Loading'
import { memoryRouter } from '~/router'
import rootStore from '~/store'

import { sendMeasurement } from './api/ga'

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

        // Send a pageview event
        sendMeasurement({
            events: [
                {
                    name: 'page_view',
                    params: {},
                },
            ],
        })
    }, [])

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
