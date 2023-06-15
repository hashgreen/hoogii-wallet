import 'react-toastify/dist/ReactToastify.css'
import 'react-tooltip/dist/react-tooltip.css'
import '~/index.scss'
import '~/utils/i18n'

import { Buffer } from 'buffer'
import ReactDOM from 'react-dom/client'

// TODO: for dev in the future
// import Components from '~/container/Components'
import App from '~/App'

window.global = window
window.Buffer = Buffer

const DevTools = () => {
    return (
        <div className="flex-center full">
            <div className="h-[600px] w-[400px]">
                <App />
            </div>
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('tools')).render(<DevTools />)
