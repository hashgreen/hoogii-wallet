import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AssetItem } from '~/components/Item'
import SearchBar from '~/components/SearchBar'
import BackLink from '~/layouts/BackLink'
import { useClosablePage } from '~/layouts/ClosablePage'
import rootStore from '~/store'
import { ICryptocurrency } from '~/types/api'
import { fuseOptions, search } from '~/utils/fuse'

import CustomPage from './components/CustomPage'

function ImportCAT() {
    const [keyword, setKeyword] = useState('')
    const { t } = useTranslation()
    useClosablePage(t('import_token-title'))
    const {
        assetsStore: { existedAssets, availableAssets },
    } = rootStore
    const [selected, setSelected] = useState<ICryptocurrency[]>([])
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

    useEffect(() => {
        return () => {
            setKeyword('')
        }
    }, [])

    const importSelected = useCallback(() => {
        selected.forEach(({ asset_id, code, icon_url }) =>
            rootStore.walletStore.db.assets.add({
                assetId: asset_id,
                code,
                iconUrl: icon_url,
            })
        )
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
                            <span className="sticky top-0 pt-4 pb-2 ml-3 text-body3 text-primary-100">
                                {selected.length
                                    ? t('count-selected_token', {
                                          count: selected.length,
                                      })
                                    : t('import_token-search_results')}
                            </span>
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
                                            (e) => e.asset_id === item.asset_id
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
                                                setSelected([...selected, item])
                                            }
                                        }}
                                    />
                                ))}
                            </div>
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
