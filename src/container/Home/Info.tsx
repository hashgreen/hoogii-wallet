import Decimal from 'decimal.js-light'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { AssetItem, LoadingAssetItem } from '~/components/Item'
import rootStore from '~/store'
import { mojoToCat, mojoToXch } from '~/utils/CoinConverter'
import { fuseOptions, search } from '~/utils/fuse'

const Info = ({ query }: { query: string }) => {
    const { t } = useTranslation()

    const {
        walletStore: { puzzleHash },
        assetsStore: { assets, balances, assetIdToPuzzleHash, isFetching },
    } = rootStore

    const filteredAssets = useMemo(
        () => search(query, assets, fuseOptions(['code', 'assetId'])),
        [query, assets]
    )

    return (
        <>
            <span className="ml-3 font-medium capitalize text-body3 text-primary-100">
                {isFetching ? (
                    <div className="skeleton skeleton-text w-10"></div>
                ) : (
                    t('count-asset', {
                        count: filteredAssets.length,
                    })
                )}
            </span>
            {isFetching
                ? [...Array(5)].map((_, index) => (
                      <LoadingAssetItem key={`LoadingAssetItem${index}`} />
                  ))
                : filteredAssets.map(({ assetId, code, iconUrl }) => {
                      const isXCH = assetId === 'XCH'
                      return (
                          <AssetItem
                              key={assetId}
                              asset={{
                                  assetId,
                                  code,
                                  iconUrl,
                              }}
                              balance={() => {
                                  if (isXCH) {
                                      const result = mojoToXch(
                                          (
                                              balances['0x' + puzzleHash] ?? 0
                                          )?.toString()
                                      )
                                      return result ? (
                                          result.toFixed(
                                              result.decimalPlaces() > 0
                                                  ? undefined
                                                  : 6
                                          )
                                      ) : (
                                          <></>
                                      )
                                  } else {
                                      return mojoToCat(
                                          balances[
                                              assetIdToPuzzleHash(assetId)
                                          ]?.toString() ?? '0'
                                      ).toFixed(3, Decimal.ROUND_DOWN)
                                  }
                              }}
                          />
                      )
                  })}
        </>
    )
}

export default observer(Info)
