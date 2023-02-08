import { AugSchemeMPL, PrivateKey } from '@rigidity/bls-signatures'
import { Program } from '@rigidity/clvm'
import { generateMnemonicAsync, mnemonicToSeedAsync } from 'bip39-web'

import { ChainEnum } from '~/types/chia'
import { xchToMojo } from '~/utils/CoinConverter'
import { chains, standardMnemonicLength } from '~/utils/constants'
import SpendBundle from '~/utils/SpendBundle'

import words from '../../../config/wordlist_en.json'
import { seedToPuzzle } from '../../utils/signature'
import { Coin } from '../../utils/Wallet/types'
import { Wallet } from '../../utils/Wallet/Wallet'
let coinOwnerPuzzle: Program
let ownerSeed: Uint8Array
let coinOwnerPuzzleHash: string = ''
const testTargetAddress =
    'txch17ynqsq33sthdx69qehtqcunnh3w36t04arlgpw4wjrkfns6twljs6y0ck3'
test('Should generate puzzle by Mnemonic', async () => {
    const testMnemonicList: string[] = (
        await generateMnemonicAsync(256, undefined, words)
    ).split(' ')
    expect(testMnemonicList.length).toEqual(standardMnemonicLength)
    ownerSeed = await mnemonicToSeedAsync(testMnemonicList?.join(' '))
    const puzzle = seedToPuzzle(ownerSeed)
    expect(puzzle.hashHex().length).toEqual(64)
    coinOwnerPuzzle = puzzle
    coinOwnerPuzzleHash = puzzle.hashHex()
})
test('Should create StandardTx SpendBundle without fee and check spendBundle is valid', async () => {
    const mockCoinList: Coin[] = [
        {
            amount: BigInt(100000000000),
            parent_coin_info:
                '0x000000000000000000000000000000000000000000000000000000000000001',
            puzzle_hash: coinOwnerPuzzleHash,
        },
    ]

    const spendAmount: string = '0.0001'
    const XCHspendsList = await Wallet.generateXCHSpendList({
        puzzle: coinOwnerPuzzle,
        memo: 'test',
        spendableCoinList: mockCoinList,
        amount: BigInt(xchToMojo(spendAmount).toString()),
        targetAddress: testTargetAddress,
    })
    const XCHsignatures = AugSchemeMPL.aggregate(
        XCHspendsList.map((spend) =>
            Wallet.signCoinSpend(
                spend,
                Buffer.from(
                    chains[ChainEnum.Testnet].agg_sig_me_additional_data,
                    'hex'
                ),
                Wallet.derivePrivateKey(PrivateKey.fromSeed(ownerSeed)),
                Wallet.derivePrivateKey(PrivateKey.fromSeed(ownerSeed)).getG1()
            )
        )
    )

    const spendBundle = new SpendBundle(XCHspendsList, XCHsignatures)
    expect(spendBundle.aggregated_signature.isValid()).toBe(true)
    expect(spendBundle.destruct()).toBeArray()
})
/**
 * Should generate puzzle by Mnemonic
 * Should create StandardTx valid SpendBundle without fee
 * Should create StandardTx valid SpendBundle with fee and check spendBundle is valid
 */
