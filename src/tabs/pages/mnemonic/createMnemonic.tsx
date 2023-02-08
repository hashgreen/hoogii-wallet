import Joi from 'joi'
import { observer } from 'mobx-react-lite'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import Mnemonic from '~/components/Mnemonic'
import { ErrorPopup } from '~/components/Popup'
import { isDev } from '~/utils/env'
import { SubLayout } from '~tabs/layout'
import rootStore from '~tabs/store'

const CreateMnemonic = () => {
    const [isValid, setIsValid] = useState(false)
    const [currentMnemonic, setCurrentMnemonic] = useState<string[]>([''])
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)

    const { t } = useTranslation()
    const {
        createMnemonicStore: {
            mnemonics,
            schema,
            createRandomInputs,
            validate,
        },
    } = rootStore
    const randomInputs = useMemo(() => createRandomInputs(isDev ? 1 : 6), [])
    const defaultValues = mnemonics.map((phrase) =>
        randomInputs.includes(phrase) ? '' : phrase
    )
    const notAvailableInputList = mnemonics.map(
        (phrase) => !randomInputs.includes(phrase)
    )

    return (
        <SubLayout
            title={t('mnemonic-create-verify-title')}
            description={t('mnemonic-create-verify-description')}
            next={{
                text: t('btn-next'),
                onClick: () => {
                    if (validate(currentMnemonic)) {
                        navigate('/mnemonic/create/password')
                    } else {
                        setOpen(true)
                    }
                },
                disabled: !isValid,
            }}
        >
            <div className="mt-7">
                <Mnemonic
                    defaultValues={defaultValues}
                    schema={Joi.object({
                        phrases: schema,
                    }).messages({
                        'any.invalid': 'error-mnemonic-invalid',
                        'any.only': 'error-mnemonic-invalid',
                        'array.includes': 'error-mnemonic-invalid',
                    })}
                    readOnly={notAvailableInputList}
                    onChange={(isValid, mnemonics) => {
                        setIsValid(isValid)
                        setCurrentMnemonic(mnemonics)
                    }}
                />
                {open && (
                    <ErrorPopup
                        title={t('mnemonic-create-popup-title')}
                        description={t('mnemonic-create-popup-description')}
                        close={() => setOpen(false)}
                    />
                )}
            </div>
        </SubLayout>
    )
}

export default observer(CreateMnemonic)
