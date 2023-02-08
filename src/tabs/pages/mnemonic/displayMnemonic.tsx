import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'

import Mnemonic from '~/components/Mnemonic'
import { standardMnemonicLength } from '~/utils/constants'
import { SubLayout } from '~tabs/layout'
import rootStore from '~tabs/store'

const DisplayMnemonic = () => {
    const { t } = useTranslation()
    const {
        createMnemonicStore: { mnemonics },
    } = rootStore

    return (
        <SubLayout
            title={t('mnemonic-create-title')}
            description={t('mnemonic-create-description')}
            next={{
                text: t('btn-next'),
                to: '/mnemonic/create/verify',
            }}
        >
            <div className="mt-7">
                <Mnemonic
                    defaultValues={mnemonics}
                    readOnly={
                        Array.from({ length: standardMnemonicLength }).fill(
                            true
                        ) as boolean[]
                    }
                />
            </div>
        </SubLayout>
    )
}

export default observer(DisplayMnemonic)
