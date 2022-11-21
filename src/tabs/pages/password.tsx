import { joiResolver } from '@hookform/resolvers/joi'
import classNames from 'classnames'
import Joi from 'joi'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { savePassword } from '~/api/extension'
import { SubLayout } from '~tabs/layout'
import rootStore from '~tabs/store'

interface IForm {
    password: string
    confirm: string
}

const schema = Joi.object({
    password: Joi.string().required(),
    confirm: Joi.ref('password'),
})

const Password = ({
    routeFor,
}: {
    routeFor: 'create' | 'import' | 'reset'
}) => {
    const { t } = useTranslation()
    const {
        register,
        setFocus,
        formState: { isValid, isDirty },
        getValues,
    } = useForm<IForm>({
        mode: 'onChange',
        resolver: joiResolver(schema),
    })
    useEffect(() => {
        setFocus('password')
    }, [])

    return (
        <SubLayout
            title={
                routeFor === 'reset'
                    ? t('password-reset_password-title')
                    : t('password-title')
            }
            description={
                routeFor === 'reset'
                    ? t('password-reset_password-description')
                    : t('password-description')
            }
            next={{
                text: routeFor === 'reset' ? t('btn-reset') : t('btn-create'),
                to: isValid
                    ? routeFor === 'reset'
                        ? '/reset/loading'
                        : `/mnemonic/${routeFor}/loading`
                    : undefined,
                onClick: () => {
                    savePassword(getValues('password'))
                },
            }}
            back={false}
        >
            <form className="flex flex-col justify-end w-full gap-3 grow mt-5">
                <input
                    type="password"
                    placeholder={t('input-password-placeholder')}
                    {...register('password', {
                        onChange: (e) => {
                            rootStore
                                .getMnemonicStore(routeFor)
                                .setPassWord(e.target.value)
                        },
                    })}
                    className="input input-landing"
                    onKeyDown={(e) => {
                        e.key === 'Enter' && setFocus('confirm')
                    }}
                />
                <div>
                    <input
                        type="password"
                        placeholder={t('input-confirm_password-placeholder')}
                        {...register('confirm')}
                        className={classNames(
                            'input input-landing',
                            !isValid && isDirty && 'input-error'
                        )}
                    />
                    {!isValid && isDirty && (
                        <div className="mt-2 text-center text-caption text-error">
                            {t('error-password-not_match')}
                        </div>
                    )}
                </div>
            </form>
        </SubLayout>
    )
}

export default observer(Password)
