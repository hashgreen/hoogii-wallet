import { joiResolver } from '@hookform/resolvers/joi'
import { sanitizeHex } from '@rigidity/chia'
import classNames from 'classnames'
import * as joi from 'joi'
import { observer } from 'mobx-react-lite'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { sendMeasurement } from '~/api/ga'
// import AssetIcon from '~/components/AssetIcon'
import ErrorMessage from '~/components/ErrorMessage'
import rootStore from '~/store'
import { ICryptocurrency } from '~/types/api'
import { fuseOptions, search } from '~/utils/fuse'

interface IForm {
    code: string
    assetId: string
}

const CustomPage = () => {
    const { t } = useTranslation()
    const [checked, setChecked] = useState(false)

    const {
        assetsStore: { existedAssets, availableAssets },
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
        watch,
        setValue,
        formState: { errors, dirtyFields, isValid },
    } = useForm<IForm>({ mode: 'onChange', resolver: joiResolver(schema) })
    // const assetId = watch('assetId')
    // const possibleAsset = availableAssets.find(
    //     (item) => item.asset_id === assetId
    // )

    const navigate = useNavigate()

    const searchField = watch('assetId')
    const code = watch('code')

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
                    name: 'custom_import_token',
                    params: {
                        category: 'import_token',
                        action: 'click',
                    },
                },
            ],
        })
        navigate(-1)
    }

    const searchResults = useMemo(() => {
        if (!errors.assetId && searchField) {
            const result = search<ICryptocurrency>(
                searchField,
                availableAssets.data,
                fuseOptions(['asset_id'])
            )

            return result?.[0]
        }

        return null
    }, [searchField, errors.assetId])

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
                    {t('import_token-custom')}
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
                            onChange={(e) =>
                                setValue(
                                    'assetId',
                                    sanitizeHex(e.target.value),
                                    {
                                        shouldValidate: true,
                                    }
                                )
                            }
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
                <>
                    {!errors.assetId && searchResults && (
                        <div
                            className="flex flex-col gap-2 mt-3 "
                            onClick={() =>
                                setValue('code', searchResults.code, {
                                    shouldValidate: true,
                                })
                            }
                        >
                            <span className="text-caption ">
                                {t('import_token-custom-search-results', {
                                    token_name: searchResults.name,
                                    token_code: searchResults.code,
                                })}
                            </span>
                            <div className="flex h-8 w-fit justify-center rounded py-[11px] px-2 flex-row cursor-pointer gap-2 text-body3 bg-white bg-opacity-5  items-center">
                                <img
                                    className="w-6 h-6 "
                                    src={searchResults.icon_url}
                                />
                                <span>{searchResults.code}</span>

                                {searchResults.code === code && (
                                    <img src="/images/icons/checked-rounded.svg" />
                                )}
                            </div>
                        </div>
                    )}
                    <div className="flex-center">
                        <button
                            type="submit"
                            className="mt-5 btn btn-primary"
                            disabled={!isValid}
                        >
                            {t('btn-import')}
                        </button>
                    </div>
                </>
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
