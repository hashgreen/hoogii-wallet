import 'react-toastify/dist/ReactToastify.css'
import 'react-tooltip/dist/react-tooltip.css'
import '~/index.scss'
import '~/utils/i18n'

import { Buffer } from 'buffer'
import ReactDOM from 'react-dom/client'

// TODO: for dev in the future
// import Components from '~/container/Components'
import App from '~/App'
import { ChainEnum } from '~/types/chia'
import { RequestMethodEnum } from '~/types/extension'

import { createMockOffer, createMockRequest, createMockTransfer } from './utils'

window.global = window
window.Buffer = Buffer

const DevTools = () => {
    return (
        <div className="flex-center full flex-col gap-10">
            <button
                className="btn btn-primary btn-large"
                onClick={createMockOffer}
            >
                Create Offer
            </button>
            <button
                className="btn btn-primary btn-large"
                onClick={createMockTransfer}
            >
                Transfer
            </button>
            <button
                className="btn btn-primary btn-large"
                onClick={() =>
                    createMockRequest(RequestMethodEnum.CONNECT, {}, false)
                }
            >
                Connect to
            </button>
            <button
                className="btn btn-primary btn-large"
                onClick={() =>
                    createMockRequest(RequestMethodEnum.WALLET_SWITCH_CHAIN, {
                        chainId: ChainEnum.Mainnet,
                    })
                }
            >
                Switch Chain
            </button>
            <div className="h-[600px] w-[400px]">
                <App />
            </div>
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('tools')).render(<DevTools />)
