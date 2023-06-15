import 'react-toastify/dist/ReactToastify.css'
import 'react-tooltip/dist/react-tooltip.css'
import '~/index.scss'
import '~/utils/i18n'

import { Buffer } from 'buffer'
import ReactDOM from 'react-dom/client'

import { closeTabs, createTab, getTabs, updateTab } from '~/api/extension/v3'
// TODO: for dev in the future
// import Components from '~/container/Components'
import App from '~/App'

window.global = window
window.Buffer = Buffer

ReactDOM.createRoot(document.getElementById('root')).render(<App />)

const url = '/tools/index.html'
const tabs = await getTabs(url)
let tab
if (tabs.length) {
    tabs[0].url !== url && (await updateTab(tabs[0], { url, active: true }))
    await closeTabs(tabs.slice(1))
    tab = tabs[0]
} else {
    tab = await createTab(url, { active: false })
}

console.log('wallet opened in tab: ', tab.id)
