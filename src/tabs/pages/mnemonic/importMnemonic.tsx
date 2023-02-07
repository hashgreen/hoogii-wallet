import Joi from 'joi'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import Mnemonic from '~/components/Mnemonic'
import { ErrorPopup } from '~/components/Popup'
import InfoIcon from '~icons/hoogii/blue-info.jsx'
import { SubLayout } from '~tabs/layout'
import rootStore from '~tabs/store'

function ImportMnemonic({ routeFor }: { routeFor: 'reset' | 'import' }) {
    const [isValid, setIsValid] = useState(false)
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const { mnemonicLength, schema, setMnemonics } =
        rootStore.getMnemonicStore(routeFor)
    const {
        resetMnemonicStore: { verifyMnemonic },
    } = rootStore
    const defaultValues = Array.from({ length: mnemonicLength }, () => '')
    const navigate = useNavigate()
    const isImportPage = routeFor === 'import'

    return (
        <SubLayout
            title={
                isImportPage
                    ? t('mnemonic-import-title')
                    : t('mnemonic-reset_password-title')
            }
            description={
                routeFor === 'import' && t('mnemonic-import-description')
            }
            next={{
                text: t('btn-next'),
                to:
                    isValid && isImportPage
                        ? '/mnemonic/import/password'
                        : undefined,
                onClick:
                    isValid && !isImportPage
                        ? async () => {
                              const isCorrectMnemonic = await verifyMnemonic()
                              if (isCorrectMnemonic) {
                                  navigate('/reset/password')
                              } else {
                                  setOpen(true)
                              }
                          }
                        : undefined,
            }}
            back={isImportPage}
        >
            <div className="bg-info-light text-black font-normal py-4 flex text-sm justify-center items-center rounded mt-5">
                <InfoIcon color=" #1A9FEA" />
                <span className="ml-2.5">{t('tooltip-paste_hint')}</span>
            </div>
            <div className="mt-7">
                {schema && (
                    <Mnemonic
                        defaultValues={defaultValues}
                        schema={Joi.object({ phrases: schema }).messages({
                            'any.invalid': 'error-mnemonic-invalid',
                            'any.only': 'error-mnemonic-invalid',
                            'array.includes': 'error-mnemonic-invalid',
                        })}
                        disabled={
                            Array.from({ length: 24 }).fill(false) as boolean[]
                        }
                        readOnly={
                            Array.from({ length: 24 }).fill(false) as boolean[]
                        }
                        onChange={(isValid, mnemonics) => {
                            setIsValid(isValid)
                            setMnemonics(mnemonics)
                        }}
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
