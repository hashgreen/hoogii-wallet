import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ConnectedSiteItem } from '~/components/Item'
import { IConnectedSite } from '~/db'
import { useClosablePage } from '~/layouts/ClosablePage'
import rootStore from '~/store'
// import connectableSites from '~config/connectableSites.json' this for white list
import InfoIcon from '~icons/hoogii/info.jsx'

const ConnectedSites = () => {
    const { t } = useTranslation()
    useClosablePage(t('setting-connected_sites'))
    const {
        walletStore: { connectedSites },
    } = rootStore
    {
        /* This part for white list */
    }

    // const availableSites = useMemo(
    //     () =>
    //         connectableSites.filter(
    //             (item) =>
    //                 !connectedSites.some(
    //                     (connectedSite) => connectedSite.url === item?.url
    //                 )
    //         ),
    //     []
    // )

    // const connectSite = async (site: IConnectedSite) => {
    //     await rootStore.walletStore.db.connectedSites.add(site)
    // }

    const disconnectSite = async (site: IConnectedSite) => {
        site.id &&
            (await rootStore.walletStore.db.connectedSites.delete(site.id))
    }

    return (
        <div className="flex flex-col gap-5 overflow-auto">
            <div className="flex flex-col gap-2">
                {connectedSites.map((site) => (
                    <ConnectedSiteItem
                        key={site.name}
                        name={site.name}
                        iconUrl={site.iconUrl}
                        href={site.url}
                        target="_blank"
                        rel="noreferrer"
                        action={() => disconnectSite(site)}
                    />
                ))}
            </div>
            <div className="gap-2 text-body1 text-primary-100 flex-col-center">
                {t('setting-connected_sites-description')}
                <div
                    className="tooltip after:w-[260px] cursor-pointer"
                    data-tip={t('tooltip-connected_sites')}
                >
                    <InfoIcon className="w-3 h-3 text-active" />
                </div>
            </div>
            {/* This part for white list */}
            {/* <div className="flex flex-col gap-2">
                {!!availableSites.length &&
                    availableSites.map((site) => (
                        <ConnectedSiteItem
                            key={site.name}
                            name={site.name}
                            iconUrl={site.iconUrl}
                            href={site.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => connectSite(site)}
                            disabled
                        />
                    ))}
            </div> */}
        </div>
    )
}

export default observer(ConnectedSites)
