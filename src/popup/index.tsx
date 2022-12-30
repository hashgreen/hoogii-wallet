import '~/index.scss'
import '~/utils/i18n'

import { observer } from 'mobx-react-lite'
import { Suspense, useEffect } from 'react'
import { render } from 'react-dom'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom'

import { MethodEnum, PopupEnum } from '~/types/extension'

import controller from './controller'
import Enable from './pages/enable'
import Locked from './pages/locked'
import Refuse from './pages/refuse'

const App = observer(() => {
    const navigate = useNavigate()

    const { locked, request } = controller

    useEffect(() => {
        document.documentElement.classList.add('dark')
        // TODO: support dark/light switch
    }, [])

    useEffect(() => {
        if (request && request.method === MethodEnum.REFUSE) {
            navigate('/refuse')
        }
        if (request && !locked) {
            switch (request.method) {
                case MethodEnum.ENABLE:
                    navigate('/enable')
                    break
            }
        }
    }, [request, locked])

    return (
        <Routes>
            <Route>
                {locked && <Route index element={<Locked />} />}
                {request && (
                    <>
                        <Route
                            path="enable"
                            element={
                                <Enable
                                    request={request}
                                    controller={controller}
                                />
                            }
                        />
                        <Route
                            path="refuse"
                            element={
                                <Refuse
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
