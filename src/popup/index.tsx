import '~/index.css'
import '~/utils/i18n'

import { observer } from 'mobx-react-lite'
import { Suspense, useEffect } from 'react'
import { render } from 'react-dom'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'

import { MethodEnum, PopupEnum, RequestMethodEnum } from '~/types/extension'

import controller from './controller'
import Connecting from './pages/connecting'
import Locked from './pages/locked'
import Refuse from './pages/refuse'
import SwitchChain from './pages/switchChain'

const App = observer(() => {
    const navigate = useNavigate()

    const { locked, connected, request, returnData } = controller

    useEffect(() => {
        document.documentElement.classList.add('dark')
        // TODO: support dark/light switch
    }, [])

    useEffect(() => {
        if (request && request.method === MethodEnum.REFUSE) {
            navigate('/refuse')
        }
        console.log('locked>', locked, 'connected>', connected)
        if (request && !locked) {
            if (!connected) {
                navigate('/refuse')
            } else {
                switch (request.data?.method) {
                    case RequestMethodEnum.WALLET_SWITCH_CHAIN:
                        navigate('/switchChain')
                        break

                    default:
                        returnData({
                            data: true,
                        })
                        window.close()
                }
            }
        }
    }, [request, locked, connected])

    return (
        <Routes>
            <Route>
                <Route index element={<Locked />} />
                {request && (
                    <>
                        <Route
                            path="refuse"
                            element={
                                <Refuse
                                    request={request}
                                    controller={controller}
                                />
                            }
                        />
                        <Route
                            path="connecting"
                            element={
                                <Connecting
                                    request={request}
                                    controller={controller}
                                />
                            }
                        />
                        <Route
                            path="switchChain"
                            element={
                                <SwitchChain
                                    request={request}
                                    controller={controller}
                                />
                            }
                        />
                    </>
                )}
            </Route>
        </Routes>
    )
})

render(
    <Suspense fallback="Loading...">
        <MemoryRouter>
            <App />
        </MemoryRouter>
    </Suspense>,
    document.getElementById(PopupEnum.INTERNAL)
)

export default App
