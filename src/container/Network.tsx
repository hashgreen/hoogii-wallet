import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import { useClosablePage } from '~/layouts/ClosablePage'
import rootStore from '~/store'
import developmentStore from '~/store/DevelopmentStore'
import { isDev } from '~/utils'
import { chains } from '~/utils/constants'

const Network = () => {
    useClosablePage('Network')
    const {
        walletStore: { chain, switchChain },
    } = rootStore
    return (
        <div className="flex flex-col">
            {chains.map((item) => (
                <label
                    key={item.id}
                    htmlFor={item.id}
                    className={classNames(
                        'gap-2 flex-row-center text-subtitle1 group py-2.5',
                        item.id === chain?.id
                            ? 'text-dark-scale-100'
                            : 'text-primary-100'
                    )}
                >
                    <input
                        type="radio"
                        name="chains"
                        id={item.id}
                        value={item.id}
                        checked={item.id === chain?.id}
                        onChange={() => switchChain(item)}
                        disabled={!isDev && item.id !== chains[1].id}
                    />
                    {item.name}
                </label>
            ))}
            {developmentStore.isEnable && (
                <input
                    type="text"
                    value={developmentStore.apiEndpoints?.jarvan}
                    className="input mt-1"
                    onChange={(e) => {
                        if (developmentStore.apiEndpoints) {
                            developmentStore.apiEndpoints.jarvan =
                                e.target.value
                        }
                    }}
                    onBlur={async (e) => {
                        await developmentStore.updateApiEndpoints(
                            e.target.value
                                ? {
                                      jarvan: e.target.value,
                                  }
                                : {}
                        )
                    }}
                />
            )}
        </div>
    )
}

export default observer(Network)
