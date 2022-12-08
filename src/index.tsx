import 'react-toastify/dist/ReactToastify.css'
import '~/utils/i18n'
import './index.css'

import { Buffer } from 'buffer'
import ReactDOM from 'react-dom'
import ReactGA from 'react-ga4'
import { ToastContainer } from 'react-toastify'

import Components from '~/container/Components'

import App from './App'

window.global = window
window.Buffer = Buffer
const GA_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID
if (GA_ID) {
    ReactGA.initialize(GA_ID)
}

ReactDOM.render(
    <>
        <App />
        {import.meta.env.VITE_BUILD_TARGET !== 'extension' && <Components />}
        <ToastContainer />
    </>,
    document.getElementById('root')
)
