import { t } from 'i18next'
import { observer } from 'mobx-react-lite'

import rootStore from '~/store'
import { shortenHash } from '~/utils'

const AddressInfo = () => {
    const {
        walletStore: { address },
    } = rootStore
    const shortenAddress = shortenHash(address)

    return (
        <div className="flex flex-col gap-2 text-body2 text-primary-100">
            {t('current-address')}
            <div className="info-box h-10">{shortenAddress}</div>
        </div>
    )
}

export default observer(AddressInfo)
