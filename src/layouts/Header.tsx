import { Menu } from '@headlessui/react'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router-dom'

import CopyTooltip from '~/components/CopyTooltip'
import Account from '~/layouts/Account'
import rootStore from '~/store'
import { isDev, shortenHash } from '~/utils'
import { mojoToXch } from '~/utils/CoinConverter'
import { chains } from '~/utils/constants'
import CopyIcon from '~icons/hoogii/copy.jsx'
import EditIcon from '~icons/hoogii/edit.jsx'
import InfoIcon from '~icons/hoogii/info.jsx'
import NetworkIcon from '~icons/hoogii/network.jsx'
import SettingsIcon from '~icons/hoogii/settings.jsx'

interface IProps {
    className?: string
}

const Header = ({ className }: IProps) => {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)
    const {
        walletStore: { chain, lock, address, puzzleHash, name, locked },
        assetsStore: { XCH, getBalanceByPuzzleHash },
    } = rootStore
    const shortenAddress = useMemo(() => shortenHash(address), [address])
    const xchBalance = mojoToXch(getBalanceByPuzzleHash('0x' + puzzleHash))

    return (
        <nav
            className={classNames(
                'justify-between flex-row-center px-8 py-3.5 z-40',
                className
            )}
        >
            <div className="flex-row-center">
                <img src="/images/logo.svg" alt="logo" className="w-10" />
                {chain?.id !== chains[0].id && (
                    <div className="gap-1 px-2 py-1 flex-row-center text-active text-body3">
                        <InfoIcon className="w-3 h-3" />
                        {chain?.name}
                    </div>
                )}
            </div>
            <div className="gap-2 flex-row-center">
                <CopyTooltip
                    dataTip={t('tooltip-copy_address')}
                    copiedDataTip={t('tooltip-copied')}
                    value={address}
                    className="px-2 py-[5px] flex-row-center gap-1 cursor-pointer rounded-sm text-body3 after:whitespace-nowrap hover:bg-white/5"
                >
                    {name ?? shortenAddress}
                    <CopyIcon className="w-3 h-3" />
                </CopyTooltip>
                <Menu as="div" className="relative">
                    <Menu.Button className="avatar bg-[url('/images/avatar.svg')]"></Menu.Button>
                    <Menu.Items className="w-[200px] bg-box border border-primary rounded absolute right-0 top-full pt-3 pb-10 mt-2">
                        <Menu.Item
                            as="div"
                            className="flex flex-col px-3 mb-3"
                            disabled
                        >
                            <Link
                                to="/"
                                onClick={lock}
                                className="btn btn-primary btn-outline"
                            >
                                {t('btn-lock')}
                            </Link>
                            <div className="relative py-5">
                                <div className="mb-1 text-subtitle2">
                                    {name ?? shortenAddress}
                                    <button
                                        className="ml-2"
                                        onClick={() => setOpen(true)}
                                    >
                                        <EditIcon className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="text-body3 text-primary-100">
                                    {xchBalance.toString()} {XCH.code}
                                </div>
                                <hr className="absolute bottom-0 w-full h-px border-primary" />
                            </div>
                        </Menu.Item>
                        {[
                            {
                                name: 'Setting',
                                icon: <SettingsIcon className="w-3 h-3" />,
                                to: '/setting',
                            },
                            ...(isDev
                                ? [
                                      {
                                          name: t('network'),
                                          icon: (
                                              <NetworkIcon className="w-3 h-3" />
                                          ),
                                          to: '/network',
                                      },
                                      {
                                          name: t('about'),
                                          icon: (
                                              <SettingsIcon className="w-3 h-3" />
                                          ),
                                          to: '',
                                      },
                                  ]
                                : []),
                        ].map((item) => (
                            <Menu.Item
                                key={item.name}
                                as={Link}
                                to={item.to}
                                className="gap-2 px-3 py-2 capitalize flex-row-center text-body3 hover:bg-white/5"
                            >
                                {item.icon}
                                {item.name}
                            </Menu.Item>
                        ))}
                    </Menu.Items>
                </Menu>
                {open && <Account open={open} setOpen={setOpen} />}
            </div>
            {locked && <Navigate to="/" replace={true} />}
        </nav>
    )
}

export default observer(Header)
