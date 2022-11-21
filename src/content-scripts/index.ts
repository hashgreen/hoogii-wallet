import Messaging from '~/api/extension/messaging'

import chia from '../injected-scripts/index?script&module'
import { setup } from './utils'

Messaging.createProxyController()

setup({ src: chia })
