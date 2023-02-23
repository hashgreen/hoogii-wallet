import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import rootStore from '~/store'
import { ChainEnum } from '~/types/chia'
import { chains } from '~/utils/constants'
import { isDev } from '~/utils/env'

import pkg from '../../package.json'
const Version = () => {
    const { t } = useTranslation()

    const [count, setCount] = useState(0)

    const {
        walletStore: { chain, switchChain },
    } = rootStore
    useEffect(() => {
        if (count >= 5) {
            setCount(0)
            if (chain.id === ChainEnum.Develop) {
                switchChain(chains[ChainEnum.Mainnet])
            } else {
                switchChain(chains[ChainEnum.Develop])
            }
        }
    }, [count])
    return (
        <span
            className="text-center text-body2 text-primary-100"
            onClick={() => {
                setCount(count + 1)
            }}
        >
            {t('version_text', {
                version: isDev ? pkg.version : pkg.version.split('-')[0],
            })}
        </span>
    )
}
export default observer(Version)
