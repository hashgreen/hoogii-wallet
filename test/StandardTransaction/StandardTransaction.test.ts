import {
    addressInfo,
    ConditionOpcode,
    sanitizeHex,
    SpendBundle,
} from '@rigidity/chia'

import { Coin } from '../../src/utils/Wallet/types'
import { Wallet } from '../../src/utils/Wallet/Wallet'
test('Should create StandardTx SpendBundle without fee and check spendBundle is valid', async () => {
    const coin: Coin[] = [
        {
            amount: BigInt(1750000000000),
            parent_coin_info:
                '0xe3b0c44298fc1c149afbf4c8996fb92400000000000000000000000000000001',
            puzzle_hash:
                '0x4f45877796d7a64e192bcc9f899afeedae391f71af3afd7e15a0792c049d23d3',
        },
    ]
    const spendAmount: string = '1000'
    const spendBundle: SpendBundle = Wallet.generateXCHSpendList({
        amount: spendAmount,
    })
    expect(spendBundle).toHaveProperty('coin_spends')
    // expect(spendBundle.coin_spends).toBe
})
/**
 * Should create StandardTx SpendBundle without fee and check spendBundle is valid
 * Should create StandardTx SpendBundle with fee and check spendBundle is valid
 */
// fantasy alter marine shiver opera ridge initial shoe outdoor snake engage math birth fine stick bunker bunker found cat cactus raven tragic permit talent
