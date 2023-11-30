import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { sendMeasurement } from '~/api/ga'
import { AssetItem } from '~/components/Item'
import { SelectedAssetList } from '~/components/List'
import SearchBar from '~/components/SearchBar'
import BackLink from '~/layouts/BackLink'
import { useClosablePage } from '~/layouts/ClosablePage'
import rootStore from '~/store'
import { Asset } from '~/types/entities'
import { fuseOptions, search } from '~/utils/fuse'
import BottomIcon from '~icons/hoogii/bottom.jsx'

import CustomPage from './components/CustomPage'

function ImportCAT() {
    const [keyword, setKeyword] = useState('')
    const { t } = useTranslation()
    useClosablePage(t('import_token-title'))
    const {
        assetsStore: { existedAssets, availableAssets },
    } = rootStore
    const [selected, setSelected] = useState<Asset[]>([])

    const [toggleSelectedList, setToggleSelectedList] = useState(false)

    const existedAssetIds = useMemo(
        () => existedAssets.map((item) => item.assetId),
        [existedAssets]
    )

    const filteredAssets = useMemo(
        () =>
            search<Asset>(
                keyword,
                availableAssets.data,
                fuseOptions(['assetId', 'code', 'name'])
            ),
        [keyword, availableAssets.data]
    )

    const handleRemoveSelected = (id: string) => {
        const newSelected = selected.filter((item) => item.assetId !== id)

        setSelected(newSelected)

        if (newSelected.length === 0) {
            setToggleSelectedList(false)
        }
    }

    useEffect(() => {
        return () => {
            setKeyword('')
        }
    }, [])

    const importSelected = useCallback(() => {
        if (selected.length > 0) {
            sendMeasurement({
                events: [
                    {
                        name: 'import_token',
                        params: {
                            category: 'import_token',
                            action: 'click',
                        },
                    },
                ],
            })

            selected.forEach(({ assetId, code, icon }) =>
                rootStore.walletStore.db.assets.add({
                    assetId,
                    code,
                    iconUrl: icon,
                })
            )
        }
    }, [selected])

    return (
        <div className="flex flex-col overflow-hidden grow">
            {keyword && filteredAssets.length === 0 && (
                <div className="w-full p-10 text-center h-fit fixed-center text-primary-100 text-body1">
                    <p>{t('no_result-assets')}</p>
                    <br />
                    <p>{t('import_token-no_result-description')}</p>
                </div>
            )}
            <SearchBar
                placeholder={t('search-assets-placeholder')}
                value={keyword}
                onChange={(e) => setKeyword(e.currentTarget.value)}
            />

            {keyword ? (
                <>
                    {filteredAssets.length > 0 && (
                        <>
                            <div className="relative top-0 pt-4 pb-2 ml-3 text-body3 text-primary-100">
                                {selected.length ? (
                                    <>
                                        <div className="flex flex-row items-center gap-[9.35px]">
                                            <span>
                                                {t('count-selected_token', {
                                                    count: selected.length,
                                                })}
                                            </span>
                                            <BottomIcon
                                                onClick={() => {
                                                    setToggleSelectedList(
                                                        !toggleSelectedList
                                                    )
                                                }}
                                                className={`w-5 h-5  text-active cursor-pointer transform transition-all ease-in-out ${classNames(
                                                    `${
                                                        toggleSelectedList &&
                                                        '-rotate-180 '
                                                    }`
                                                )}`}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <span>
                                        {t('import_token-search_results')}
                                    </span>
                                )}
                            </div>
                            {toggleSelectedList ? (
                                <SelectedAssetList
                                    assets={selected}
                                    onRemove={(assetId) =>
                                        handleRemoveSelected(assetId)
                                    }
                                />
                            ) : (
                                <div className="flex flex-col gap-2 overflow-auto">
                                    {filteredAssets.map((item, index) => (
                                        <AssetItem
                                            key={`${item.assetId}_${index}`}
                                            asset={{
                                                assetId: item.assetId,
                                                code: item.code,
                                                iconUrl: item.icon,
                                            }}
                                            active={selected.some(
                                                (e) =>
                                                    e.assetId === item.assetId
                                            )}
                                            disabled={existedAssetIds?.some(
                                                (id) => id === item.assetId
                                            )}
                                            onClick={() => {
                                                if (
                                                    selected.some(
                                                        (e) =>
                                                            e.assetId ===
                                                            item.assetId
                                                    )
                                                ) {
                                                    setSelected([
                                                        ...selected.filter(
                                                            (e) =>
                                                                e.assetId !==
                                                                item.assetId
                                                        ),
                                                    ])
                                                } else {
                                                    setSelected([
                                                        ...selected,
                                                        item,
                                                    ])
                                                }
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </>
            ) : (
                <>
                    <hr className="my-5 border-primary/30" />
                    <CustomPage />
                </>
            )}
            <div className="grow"></div>
            {keyword && !!filteredAssets?.length && (
                <div className="flex justify-between gap-4 child:w-full mt-7">
                    <BackLink className="btn btn-secondary">
                        {t('btn-cancel')}
                    </BackLink>

                    <BackLink
                        className="btn btn-primary"
                        onClick={importSelected}
                    >
                        {t('btn-import')}
                    </BackLink>
                </div>
            )}
        </div>
    )
}

export default observer(ImportCAT)
