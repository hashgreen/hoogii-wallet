import Joi from 'joi'
import { observer } from 'mobx-react-lite'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import Mnemonic from '~/components/Mnemonic'
import { ErrorPopup } from '~/components/Popup'
import { SubLayout } from '~tabs/layout'
import rootStore from '~tabs/store'

function ImportMnemonic({
    routeFor = 'import',
}: {
    routeFor?: 'reset' | 'import'
}) {
    const [isValid, setIsValid] = useState(false)
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const { mnemonicLength, schema, setMnemonics } =
        rootStore.getMnemonicStore(routeFor) || {}
    const { verifyMnemonic, mnemonics } = rootStore.resetMnemonicStore || {}
    const defaultValues = useMemo(
        () => Array.from({ length: mnemonicLength ?? 0 }, () => ''),
        [mnemonicLength]
    )
    const navigate = useNavigate()

    return (
        <SubLayout
            title={
                routeFor === 'import'
                    ? t('mnemonic-import-title')
                    : t('mnemonic-reset_password-title')
            }
            description={
                routeFor === 'import' && t('mnemonic-import-description')
            }
            next={{
                text: t('btn-next'),
                to:
                    (isValid &&
                        routeFor === 'import' &&
                        '/mnemonic/import/password') ||
                    undefined,
                onClick:
                    routeFor === 'reset' && isValid
                        ? async () => {
                              const result = await verifyMnemonic?.(mnemonics)
                              if (result) {
                                  navigate('/reset/password')
                              } else {
                                  setOpen(true)
                              }
                          }
                        : undefined,
            }}
            back={routeFor === 'import'}
        >
            <div className="mt-7">
                {schema && (
                    <Mnemonic
                        defaultValues={defaultValues}
                        schema={Joi.object({ phrases: schema }).messages({
                            'any.invalid': 'error-mnemonic-invalid',
                            'any.only': 'error-mnemonic-invalid',
                            'array.includes': 'error-mnemonic-invalid',
                        })}
                        onChange={(isValid, mnemonics) => {
                            setIsValid(isValid)
                            setMnemonics?.(mnemonics)
                        }}
                        showPasteHint
                    />
                )}
                {open && (
                    <ErrorPopup
                        title={t('mnemonic-reset_password-popup-title')}
                        description={t(
                            'mnemonic-reset_password-popup-description'
                        )}
                        close={() => setOpen(false)}
                    />
                )}
            </div>
        </SubLayout>
    )
}

export default observer(ImportMnemonic)
