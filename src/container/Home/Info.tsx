import Decimal from 'decimal.js-light'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import { AssetItem, LoadingAssetItem } from '~/components/Item'
import rootStore from '~/store'
import { mojoToCat, mojoToXch } from '~/utils/CoinConverter'
import { fuseOptions, search } from '~/utils/fuse'

const Info = ({ query }: { query: string }) => {
    const { t } = useTranslation()

    const {
        walletStore: { puzzleHash, locked },
        assetsStore: {
            assets,
            assetIdToPuzzleHash,
            balancesData,
            getBalanceByPuzzleHash,
        },
    } = rootStore

    const filteredAssets = useMemo(
        () => search(query, assets, fuseOptions(['code', 'assetId'])),
        [query, assets]
    )

    return (
        <>
            <span className="ml-3 font-medium capitalize text-body3 text-primary-100">
                {balancesData.isFetching ? (
                    <div className="skeleton skeleton-text w-10"></div>
                ) : (
                    t('count-asset', {
                        count: filteredAssets.length,
                    })
                )}
            </span>
            {balancesData.isFetching
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
                                          getBalanceByPuzzleHash(
                                              '0x' + puzzleHash
                                          )
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
                                          getBalanceByPuzzleHash(
                                              assetIdToPuzzleHash(assetId)
                                          )
                                      ).toFixed(3, Decimal.ROUND_DOWN)
                                  }
                              }}
                          />
                      )
                  })}
            {locked && <Navigate to="/locked" replace={true} />}
        </>
    )
}

export default observer(Info)
