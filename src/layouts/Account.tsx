import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Popup from '~/components/Popup'
import rootStore from '~/store'
import { shortenHash } from '~/utils'

interface IProps {
    open: boolean
    setOpen: (open: boolean) => void
}

const Account = ({ open, setOpen }: IProps) => {
    const { t } = useTranslation()
    const { walletStore } = rootStore
    const address = useMemo(
        () => shortenHash(walletStore.address),
        [walletStore.address]
    )
    const [name, setName] = useState(walletStore.name ?? '')
    const [isEdit, setIsEdit] = useState(false)
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const isValid = useMemo(() => password === confirm, [password, confirm])
    const isError = useMemo(
        () => !isValid && password && confirm,
        [password, confirm, isValid]
    )
    const disabled = useMemo(() => {
        // change name only
        if (name && !password && !confirm) return false
        return !isValid
    }, [name, password, confirm, isValid])
    const onSubmit = async () => {
        if (name !== walletStore?.name) await walletStore?.editName(name)
        if (password && confirm && isValid) {
            walletStore.updatePassword(password)
        }
        setOpen(false)
    }
    return open ? (
        <Popup
            close={() => setOpen(false)}
            actionButton={
                <button
                    onClick={onSubmit}
                    className="btn btn-primary"
                    disabled={disabled || !isEdit}
                >
                    {t('btn-save')}
                </button>
            }
            className="w-full"
        >
            <div className="flex flex-col gap-10 text-center">
                <div className="capitalize text-headline3">
                    {t('account-title')}
                </div>
                <div>
                    <input
                        type="text"
                        placeholder={address}
                        value={name}
                        onChange={(e) => {
                            setName(e.currentTarget.value)
                            setIsEdit(true)
                        }}
                        className="input"
                    />
                    <div className="mt-1 text-left text-caption text-primary-100">
                        {t('account-address-description')}
                    </div>
                </div>
                <div>
                    <input
                        type="password"
                        placeholder={t('input-new_password-placeholder')}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.currentTarget.value)
                            setIsEdit(true)
                        }}
                        className="mb-2 input"
                    />
                    <div>
                        <input
                            type="password"
                            placeholder={t(
                                'input-confirm_password-placeholder'
                            )}
                            value={confirm}
                            onChange={(e) => {
                                setConfirm(e.currentTarget.value)
                                setIsEdit(true)
                            }}
                            className={classNames(
                                'input',
                                isError && 'input-error'
                            )}
                        />
                        {isError && (
                            <div className="mt-2 text-center text-caption text-error">
                                {t('error-password-not_match')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Popup>
    ) : (
        <></>
    )
}

export default observer(Account)
