import classNames from 'classnames'
import { forwardRef, HTMLProps, useState } from 'react'

import CloseIcon from '~icons/hoogii/close.jsx'
import SearchIcon from '~icons/hoogii/search.jsx'

interface IProps {
    collapsible?: boolean
    onClose?: (isCollapsed: boolean) => void
    className?: string
}

const SearchBar = forwardRef<
    HTMLInputElement,
    IProps & HTMLProps<HTMLInputElement>
>(({ collapsible = false, onClose, className, ...rest }, ref) => {
    const [expand, setExpand] = useState(!collapsible)

    return (
        <div
            className={classNames(
                'relative gap-2 flex-row-center justify-end origin-right',
                !collapsible || expand ? 'w-full' : 'w-min',
                className
            )}
        >
            {!collapsible && <SearchIcon className="absolute w-3 h-3 left-2" />}
            <input
                ref={ref}
                type="search"
                autoComplete="off"
                className={classNames(
                    `h-7 rounded-[20px] bg-box placeholder:text-text py-[5px] text-body3 pr-2 outline-none
                    border border-primary 
                    transition-all origin-right`,
                    !collapsible ? 'pl-7' : 'pl-3',
                    expand ? 'w-full opacity-100' : 'w-0 opacity-0'
                )}
                {...rest}
            />
            {collapsible && (
                <button
                    className="rounded-full w-7 h-7 p-1.5 bg-white/5 flex-center hover:shadow-[0px_0px_6px_#716EFF]"
                    onClick={() => {
                        setExpand(!expand)
                        onClose?.(expand)
                    }}
                >
                    {expand ? (
                        <CloseIcon className="absolute w-4 h-4" />
                    ) : (
                        <SearchIcon className="absolute w-4 h-4" />
                    )}
                </button>
            )}
        </div>
    )
})
SearchBar.displayName = 'SearchBar'
export default SearchBar
