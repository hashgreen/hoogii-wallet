import { Tab } from '@headlessui/react'
import classNames from 'classnames'
import { ReactNode } from 'react'

interface IProps {
    tabs: string[]
    defaultIndex?: number
    onChange?: (index: number) => void
    navChildren?: ReactNode
    children: (tab: string, index: number) => ReactNode
}

const Tabs = ({
    tabs,
    defaultIndex,
    onChange,
    navChildren,
    children,
}: IProps) => {
    return (
        <Tab.Group defaultIndex={defaultIndex} onChange={onChange}>
            <Tab.List className="relative w-full gap-1 mb-4 flex-row-center">
                {tabs.map((item) => (
                    <Tab
                        key={item}
                        className={({ selected }) =>
                            classNames(
                                'text-subtitle2 px-3 py-[5.5px] outline-none capitalize',
                                selected
                                    ? 'rounded-[40px] bg-white/5'
                                    : 'text-text'
                            )
                        }
                    >
                        {item}
                    </Tab>
                ))}
                {navChildren}
            </Tab.List>
            <Tab.Panels>
                {tabs.map((tab, index) => (
                    <Tab.Panel key={tab} className="flex flex-col gap-2">
                        {children(tab, index)}
                    </Tab.Panel>
                ))}
            </Tab.Panels>
        </Tab.Group>
    )
}

export default Tabs
