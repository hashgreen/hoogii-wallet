import 'react-toastify/dist/ReactToastify.css'
import '~/utils/i18n'
import './index.scss'

import { Buffer } from 'buffer'
import ReactDOM from 'react-dom'

import Components from '~/container/Components'

import App from './App'

window.global = window
window.Buffer = Buffer
ReactDOM.render(
    <>
        <App />
        <Components />
    </>,
    document.getElementById('root')
)
