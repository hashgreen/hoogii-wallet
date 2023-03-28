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
import { ICryptocurrency } from '~/types/api'
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
    const [selected, setSelected] = useState<ICryptocurrency[]>([])

    const [toggleSelectedList, setToggleSelectedList] = useState(false)

    const existedAssetIds = useMemo(
        () => existedAssets.map((item) => item.assetId),
        [existedAssets]
    )

    const filteredAssets = useMemo(
        () =>
            search<ICryptocurrency>(
                keyword,
                availableAssets.data,
                fuseOptions(['asset_id', 'code', 'name'])
            ),
        [keyword, availableAssets.data]
    )

    const handleRemoveSelected = (id: string) => {
        const newSelected = selected.filter((item) => item.asset_id !== id)

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

            selected.forEach(({ asset_id, code, icon_url }) =>
                rootStore.walletStore.db.assets.add({
                    assetId: asset_id,
                    code,
                    iconUrl: icon_url,
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
                            {toggleSelectedList && selected.length > 0 ? (
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
                                            key={`${item.asset_id}_${index}`}
                                            asset={{
                                                assetId: item.asset_id,
                                                code: item.code,
                                                iconUrl: item.icon_url,
                                            }}
                                            active={selected.some(
                                                (e) =>
                                                    e.asset_id === item.asset_id
                                            )}
                                            disabled={existedAssetIds?.some(
                                                (id) => id === item.asset_id
                                            )}
                                            onClick={() => {
                                                if (
                                                    selected.some(
                                                        (e) =>
                                                            e.asset_id ===
                                                            item.asset_id
                                                    )
                                                ) {
                                                    setSelected([
                                                        ...selected.filter(
                                                            (e) =>
                                                                e.asset_id !==
                                                                item.asset_id
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
