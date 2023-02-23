import 'react-toastify/dist/ReactToastify.css'
import 'react-tooltip/dist/react-tooltip.css'
import '~/utils/i18n'
import './index.scss'

import { Buffer } from 'buffer'
import ReactDOM from 'react-dom/client'

// TODO: for dev in the future
// import Components from '~/container/Components'
import App from './App'

window.global = window
window.Buffer = Buffer

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
