import '~/index.scss'
import '~/utils/i18n'

import { observer } from 'mobx-react-lite'
import { Suspense, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
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
ReactDOM.createRoot(document.getElementById(PopupEnum.INTERNAL)).render(
    <Suspense fallback={<div className="full bg-main" />}>
        <MemoryRouter>
            <App />
        </MemoryRouter>
    </Suspense>
)

export default App
