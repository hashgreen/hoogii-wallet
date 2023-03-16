import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import { sendMeasurement } from '~/api/ga'
import { useClosablePage } from '~/layouts/ClosablePage'
import rootStore from '~/store'
import developmentStore from '~/store/DevelopmentStore'
import { ChainEnum, IChain } from '~/types/chia'
import { ActionEnum, CategoryEnum, EventEnum } from '~/types/ga'
import { chains } from '~/utils/constants'

const Network = () => {
    useClosablePage('Network')
    const {
        walletStore: { chain, switchChain },
    } = rootStore

    const handleSwitchChain = (chain: IChain) => {
        sendMeasurement({
            events: [
                {
                    name:
                        chain.name === 'Mainnet'
                            ? EventEnum.SWITCH_TO_MAINNET
                            : EventEnum.SWITCH_TO_TESTNET,
                    params: {
                        category: CategoryEnum.NETWORK,
                        action: ActionEnum.CLICK,
                    },
                },
            ],
        })
        switchChain(chain)
    }

    return (
        <div className="flex flex-col">
            {Object.values(chains)
                .filter((item) =>
                    chain.id === ChainEnum.Develop
                        ? true
                        : item.id !== ChainEnum.Develop
                )
                .map((item) => (
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
                            onChange={() => handleSwitchChain(item)}
                        />
                        {item.name}
                    </label>
                ))}
            {developmentStore.isEnable && (
                <input
                    type="text"
                    value={developmentStore.apiEndpoints?.jarvan}
                    className="mt-1 input"
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
