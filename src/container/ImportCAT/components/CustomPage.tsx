import { joiResolver } from '@hookform/resolvers/joi'
import classNames from 'classnames'
import * as joi from 'joi'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { sendMeasurement } from '~/api/ga'
// import AssetIcon from '~/components/AssetIcon'
import ErrorMessage from '~/components/ErrorMessage'
import rootStore from '~/store'
import { ActionEnum, CategoryEnum, EventEnum } from '~/types/ga'

interface IForm {
    code: string
    assetId: string
}

const CustomPage = () => {
    const { t } = useTranslation()
    const [checked, setChecked] = useState(false)

    const {
        assetsStore: { existedAssets },
    } = rootStore

    const schema = joi
        .object({
            code: joi.string().empty('').max(12).message('error-code-invalid'),
            assetId: joi
                .string()
                .empty('')
                .length(64)
                .invalid(...existedAssets.map((item) => item.assetId))
                .messages({
                    'string.length': 'error-assetId-invalid',
                    'any.invalid': 'error-assetId-duplicated',
                }),
        })
        .min(2)

    const {
        register,
        handleSubmit,
        // watch,
        formState: { errors, dirtyFields, isValid },
    } = useForm<IForm>({ mode: 'onChange', resolver: joiResolver(schema) })
    // const assetId = watch('assetId')
    // const possibleAsset = availableAssets.find(
    //     (item) => item.asset_id === assetId
    // )

    const navigate = useNavigate()

    const onSubmit = async (data, e) => {
        e.preventDefault()
        const { assetId, code } = data
        await rootStore.walletStore.db.assets.add({
            assetId,
            code,
            iconUrl: '',
        })
        sendMeasurement({
            events: [
                {
                    name: EventEnum.CUSTOM_IMPORT_TOKEN,
                    params: {
                        category: CategoryEnum.IMPORT_TOKEN,
                        action: ActionEnum.CLICK,
                    },
                },
            ],
        })
        navigate(-1)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2 select-none">
                <label htmlFor="custom" className="gap-2 flex-row-center">
                    <input
                        type="checkbox"
                        name="custom"
                        id="custom"
                        checked={checked}
                        onChange={(e) => setChecked(e.currentTarget.checked)}
                    />
                    Custom
                </label>
                {checked && (
                    <>
                        <input
                            type="text"
                            placeholder={t(
                                'input-import_custom_token-code-placeholder'
                            )}
                            {...register('code')}
                            className={classNames(
                                'input',
                                dirtyFields.code && errors.code && 'input-error'
                            )}
                        />
                        {dirtyFields.code && (
                            <ErrorMessage
                                errors={errors}
                                field={{ key: 'code' }}
                                className=""
                                t={t}
                            />
                        )}
                        <input
                            type="text"
                            placeholder={t(
                                'input-import_custom_token-asset_id-placeholder'
                            )}
                            {...register('assetId')}
                            className={classNames(
                                'input',
                                dirtyFields.assetId &&
                                    errors.assetId &&
                                    'input-error'
                            )}
                        />
                        {/* {possibleAsset && (
                            <div className="flex-row-center">
                                possible:
                                <button className="px-2 py-1 ml-2 border border-dotted rounded-full flex-row-center w-fit">
                                    <AssetIcon
                                        assetId={possibleAsset.asset_id}
                                        src={possibleAsset.icon_url}
                                        alt={possibleAsset.code}
                                    />
                                    {possibleAsset.code}
                                </button>
                            </div>
                        )} */}
                        {dirtyFields.assetId && (
                            <ErrorMessage
                                errors={errors}
                                field={{ key: 'assetId' }}
                                className=""
                                t={t}
                            />
                        )}
                    </>
                )}
            </div>
            {checked && (
                <div className="flex-center">
                    <button
                        type="submit"
                        className="mt-5 btn btn-primary"
                        disabled={!isValid}
                    >
                        {t('btn-import')}
                    </button>
                </div>
            )}
            {!checked && (
                <span className="fixed-center whitespace-nowrap text-primary-100">
                    {t('import_token-custom-description')}
                </span>
            )}
        </form>
    )
}

export default observer(CustomPage)
