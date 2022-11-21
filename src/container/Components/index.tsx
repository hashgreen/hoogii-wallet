import classNames from 'classnames'
import { PropsWithChildren, useState } from 'react'

import CopyTooltip from '~/components/CopyTooltip'
import { AssetItem } from '~/components/Item'
import SearchBar from '~/components/SearchBar'
import Tabs from '~/components/Tabs'
import Transaction from '~/components/Transaction/Transaction'
import { ITxStatus, IType } from '~/components/Transaction/type'
import Header from '~/layouts/Header'
import { enumArray } from '~/utils'
import ActivityCancelIcon from '~icons/hoogii/activity-cancel.jsx'
import BottomIcon from '~icons/hoogii/bottom.jsx'

import Color from './color'
import Typography from './typography'

export const Group = ({
    title,
    children,
    className,
}: PropsWithChildren<{
    title: string
    className?: string
}>) => {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-xl font-medium">{title}</h1>
            <div className={classNames('flex gap-3', className)}>
                {children}
            </div>
        </div>
    )
}

enum TabEnum {
    Typography,
    Color,
    Component,
}

const Components = () => {
    const [open, setOpen] = useState(false)
    const [tab, setTab] = useState(
        Number(localStorage.getItem('component-demo-tab'))
    )
    const [value, setValue] = useState('')

    return (
        <div
            className={classNames(
                'fixed top-0 right-0 overflow-auto bg-secondary text-dark-scale-100',
                open ? 'w-2/3 p-10 h-full flex flex-col gap-4' : 'max-w-min'
            )}
        >
            <button
                className="fixed top-10 right-10 btn btn-CTA_landing"
                onClick={() => setOpen(!open)}
            >
                {open ? 'close' : 'open'}
            </button>
            {open && (
                <>
                    <div className="mt-10">
                        <Header></Header>
                    </div>
                    <Tabs
                        tabs={enumArray(TabEnum).map((e) => TabEnum[e])}
                        defaultIndex={tab}
                        onChange={(tab) => {
                            localStorage.setItem(
                                'component-demo-tab',
                                tab.toString()
                            )
                            setTab(tab)
                        }}
                    >
                        {(tab, index) => (
                            <>
                                <div className="flex flex-col p-[60px] bg-[#F0F0F0] text-black">
                                    <div className="mb-[98px]">
                                        <div className="mb-2 text-xl">
                                            Hoogii Design
                                        </div>
                                        <div className="text-6xl">
                                            {TabEnum[index]}
                                        </div>
                                    </div>
                                    {index === TabEnum.Typography && (
                                        <Typography />
                                    )}
                                    {index === TabEnum.Color && <Color />}
                                    {index === TabEnum.Component && (
                                        <>
                                            <Group title="Loading">
                                                <div className="w-16 h-16 loading"></div>
                                            </Group>
                                            <Group title="Dropdown">
                                                <Transaction
                                                    status={
                                                        ITxStatus.TX_STATUS_UNSPECIFIED
                                                    }
                                                    action={IType.Send}
                                                    amount={200}
                                                    fee={0.06}
                                                    createdAt={new Date()}
                                                    sender={
                                                        '00aca8ed4d7c3356957889b9ca78bb6926014d15b876af4726b534f10d2bcdd8'
                                                    }
                                                    receiver={
                                                        '00aca8ed4d7c3356957889b9ca78bb6926014d15b876af4726b534f10d2bcdd8'
                                                    }
                                                    txType={4}
                                                    txId={
                                                        '00aca8ed4d7c3356957889b9ca78bb6926014d15b876af4726b534f10d2bcdd8'
                                                    }
                                                    cname={'Hoogii'}
                                                    assetId={'XCH'}
                                                />
                                            </Group>
                                            <Group title="Checkbox">
                                                <input type="checkbox" />
                                            </Group>
                                            <Group title="Search Bar">
                                                <div className="flex flex-col w-full child:flex child:w-full child:h-7 child:relative">
                                                    <div>
                                                        <SearchBar
                                                            value={value}
                                                            onChange={(e) => {
                                                                setValue(
                                                                    e
                                                                        .currentTarget
                                                                        .value
                                                                )
                                                            }}
                                                            placeholder="Seach Name, asset ID, etc"
                                                        />
                                                    </div>
                                                    <div>
                                                        <SearchBar
                                                            className="!absolute right-0"
                                                            value={value}
                                                            placeholder="Seach Name, asset ID, etc"
                                                            collapsible
                                                        />
                                                    </div>
                                                </div>
                                            </Group>
                                            <Group title="AssetItem">
                                                <div className="flex flex-col w-full gap-4">
                                                    <AssetItem
                                                        asset={{
                                                            assetId: 'Token',
                                                            code: 'Token',
                                                            iconUrl:
                                                                '/chia.png',
                                                        }}
                                                        balance={() => '0.0'}
                                                    />
                                                    <AssetItem
                                                        asset={{
                                                            assetId: 'Token',
                                                            code: 'Token',
                                                            iconUrl:
                                                                '/chia.png',
                                                        }}
                                                        balance={() => '0.0'}
                                                    />
                                                    <AssetItem
                                                        asset={{
                                                            assetId: 'Token',
                                                            code: 'Token',
                                                            iconUrl:
                                                                '/chia.png',
                                                        }}
                                                        balance={() => '0.0'}
                                                        active
                                                    />
                                                    <AssetItem
                                                        asset={{
                                                            assetId: 'Token',
                                                            code: 'Token',
                                                            iconUrl:
                                                                '/chia.png',
                                                        }}
                                                        balance={() => '0.0'}
                                                        disabled
                                                    />
                                                </div>
                                            </Group>
                                            <Group title="Avatar">
                                                <div className="avatar bg-[url('/images/avatar.svg')]"></div>
                                            </Group>
                                            <Group title="Tooltip">
                                                <CopyTooltip
                                                    dataTip="Copy"
                                                    copiedDataTip="Copied Text"
                                                    value="Copied Text"
                                                >
                                                    <button className="btn btn-CTA_landing">
                                                        Text
                                                    </button>
                                                </CopyTooltip>
                                                <div
                                                    className="tooltip tooltip-open"
                                                    data-tip="Copy"
                                                >
                                                    <button className="btn btn-CTA_landing">
                                                        Text
                                                    </button>
                                                </div>
                                            </Group>
                                            <Group title="Icon">
                                                <ActivityCancelIcon className="text-primary" />
                                                <BottomIcon className="w-5 h-5" />
                                            </Group>
                                            <Group title="Bg">
                                                <div className="bg-main w-[400px] h-[600px]"></div>
                                                <div className="w-[400px] h-[600px] flex-center">
                                                    <div className="w-16 h-16 loading"></div>
                                                </div>
                                            </Group>
                                            <Group title="Input">
                                                <input
                                                    type="text"
                                                    className="input"
                                                    placeholder="Text"
                                                />
                                                <input
                                                    type="text"
                                                    className="input input-error"
                                                    placeholder="Text"
                                                />
                                                <input
                                                    type="password"
                                                    className="input input-landing"
                                                    placeholder="Text"
                                                />
                                                <input
                                                    type="text"
                                                    className="input input-mnemonics"
                                                    placeholder="Text"
                                                />
                                            </Group>
                                            <Group title="Btn">
                                                <div className="flex flex-col gap-4 child:gap-4">
                                                    <div className="flex">
                                                        <button className="btn btn-CTA_landing">
                                                            Text
                                                        </button>
                                                        <button
                                                            className="btn btn-CTA_landing"
                                                            disabled
                                                        >
                                                            Disabled
                                                        </button>
                                                        <button className="btn btn-large btn-CTA_landing">
                                                            Large
                                                        </button>
                                                        <button className="btn btn-CTA_main">
                                                            Send
                                                        </button>
                                                    </div>
                                                    <div className="flex">
                                                        <button className="btn btn-CTA_landing btn-outline">
                                                            Text
                                                        </button>
                                                        <button className="btn btn-large btn-CTA_landing btn-outline">
                                                            Large
                                                        </button>
                                                    </div>
                                                    <div className="flex">
                                                        <button className="btn btn-primary">
                                                            Primary
                                                        </button>
                                                        <button
                                                            className="btn btn-primary"
                                                            disabled
                                                        >
                                                            Primary(disabled)
                                                        </button>
                                                    </div>
                                                    <div className="flex">
                                                        <button className="btn btn-secondary">
                                                            Secondary
                                                        </button>
                                                        <button
                                                            className="btn btn-secondary"
                                                            disabled
                                                        >
                                                            Secondary(disabled)
                                                        </button>
                                                    </div>
                                                    <div className="flex">
                                                        <button className="btn btn-tertiary">
                                                            Tertiary
                                                        </button>
                                                        <button
                                                            className="btn btn-tertiary"
                                                            disabled
                                                        >
                                                            Tertiary(disabled)
                                                        </button>
                                                    </div>
                                                    <div className="flex">
                                                        <button className="btn btn-primary btn-outline">
                                                            Primary
                                                        </button>
                                                        <button
                                                            className="btn btn-primary btn-outline"
                                                            disabled
                                                        >
                                                            Primary
                                                        </button>
                                                        <button className="btn btn-secondary btn-outline">
                                                            Secondary
                                                        </button>
                                                        <button
                                                            className="btn btn-secondary btn-outline"
                                                            disabled
                                                        >
                                                            Secondary
                                                        </button>
                                                        <button className="btn btn-tertiary btn-outline">
                                                            Tertiary
                                                        </button>
                                                        <button
                                                            className="btn btn-tertiary btn-outline"
                                                            disabled
                                                        >
                                                            Tertiary(disabled)
                                                        </button>
                                                    </div>
                                                    <div className="flex">
                                                        <button className="btn btn-error">
                                                            Error
                                                        </button>
                                                        <button
                                                            className="btn btn-error"
                                                            disabled
                                                        >
                                                            Error(disabled)
                                                        </button>
                                                        <button className="btn btn-error btn-outline">
                                                            Error
                                                        </button>
                                                        <button
                                                            className="btn btn-error btn-outline"
                                                            disabled
                                                        >
                                                            Error(disabled)
                                                        </button>
                                                    </div>
                                                    <div className="flex">
                                                        <button className="btn btn-cyan-500">
                                                            cyan-500
                                                        </button>
                                                        <button
                                                            className="btn btn-cyan-500"
                                                            disabled
                                                        >
                                                            cyan-500(disabled)
                                                        </button>
                                                        <button className="btn btn-cyan-500 btn-outline">
                                                            cyan-500
                                                        </button>
                                                        <button
                                                            className="btn btn-cyan-500 btn-outline"
                                                            disabled
                                                        >
                                                            cyan-500(disabled)
                                                        </button>
                                                    </div>
                                                </div>
                                            </Group>
                                        </>
                                    )}
                                </div>
                            </>
                        )}
                    </Tabs>
                </>
            )}
        </div>
    )
}

export default Components
