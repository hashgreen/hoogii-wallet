import Joi from 'joi'
import { observer } from 'mobx-react-lite'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Mnemonic from '~/components/Mnemonic'
import { isDev } from '~/utils'
import { SubLayout } from '~tabs/layout'
import rootStore from '~tabs/store'

const CreateMnemonic = ({ verifying = false }: { verifying?: boolean }) => {
    const [isValid, setIsValid] = useState(false)
    const { t } = useTranslation()
    const {
        createMnemonicStore: { mnemonics, schema, createRandomInputs },
    } = rootStore
    const [randomInputs = {}] = useMemo(
        () =>
            verifying && createRandomInputs
                ? createRandomInputs(isDev ? 1 : 6)
                : [],

        [verifying, createRandomInputs]
    )
    const defaultValues = useMemo(
        () =>
            mnemonics
                ? mnemonics.map((phrase) =>
                      phrase in randomInputs ? '' : phrase
                  )
                : undefined,
        [mnemonics, randomInputs]
    )
    const readOnly = useMemo(
        () =>
            randomInputs && mnemonics
                ? mnemonics.map((phrase) => !(phrase in randomInputs))
                : true,
        [randomInputs, mnemonics]
    )
    const disabled = useMemo(
        () =>
            verifying && mnemonics
                ? mnemonics.map((phrase) => !(phrase in randomInputs))
                : false,
        [randomInputs, mnemonics]
    )

    return (
        <SubLayout
            title={
                verifying
                    ? t('mnemonic-create-verify-title')
                    : t('mnemonic-create-title')
            }
            description={
                verifying
                    ? t('mnemonic-create-verify-description')
                    : t('mnemonic-create-description')
            }
            next={{
                text: t('btn-next'),
                to: verifying
                    ? isValid
                        ? '/mnemonic/create/password'
                        : undefined
                    : '/mnemonic/create/verify',
            }}
            back={!verifying}
        >
            <div className="mt-7">
                {mnemonics && (
                    <Mnemonic
                        defaultValues={defaultValues}
                        schema={Joi.object({
                            phrases: schema,
                        }).messages({
                            'any.invalid': 'error-mnemonic-invalid',
                            'any.only': 'error-mnemonic-invalid',
                            'array.includes': 'error-mnemonic-invalid',
                        })}
                        disabled={disabled}
                        readOnly={readOnly}
                        onChange={setIsValid}
                    />
                )}
            </div>
        </SubLayout>
    )
}

export default observer(CreateMnemonic)
