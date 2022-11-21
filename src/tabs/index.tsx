import '~/index.css'
import '~/utils/i18n'

import { Buffer } from 'buffer'
import { observer } from 'mobx-react-lite'
import { Suspense, useEffect } from 'react'
import { render } from 'react-dom'
import { RouterProvider } from 'react-router-dom'

import rootStore from '~tabs/store'

import router from './router'

window.global = window
window.Buffer = Buffer

const App = observer(() => {
    const { request } = rootStore

    useEffect(() => {
        document.documentElement.classList.add('dark')
    }, [])

    return request ? (
        <Suspense fallback="Loading...">
            <RouterProvider router={router} />
        </Suspense>
    ) : (
        <></>
    )
})

render(<App />, document.getElementById('tabs'))
