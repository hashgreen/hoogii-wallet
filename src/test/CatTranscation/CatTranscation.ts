import { AugSchemeMPL, fromHex, PrivateKey } from '@rigidity/bls-signatures'
import { addressInfo } from '@rigidity/chia'
import { Program } from '@rigidity/clvm'
import { generateMnemonicAsync, mnemonicToSeedAsync } from 'bip39-web'

import { CAT } from '~/utils/CAT'
import { chains } from '~/utils/constants'
import SpendBundle from '~/utils/SpendBundle'

import words from '../../../config/wordlist_en.json'
import { seedToPuzzle } from '../../utils/signature'
import { Coin } from '../../utils/Wallet/types'
import { Wallet } from '../../utils/Wallet/Wallet'

let ownerSeed: Uint8Array
let coinOwnerPuzzleHash: string = ''
let wallet
const testTargetAddress =
    'txch17ynqsq33sthdx69qehtqcunnh3w36t04arlgpw4wjrkfns6twljs6y0ck3'
const assetId = fromHex(
    '73dd418ff67e6079f06c7cc8cee637c7adc314210dca26997d634692f6c16087'
)

test('Should generate puzzle by Mnemonic', async () => {
    const testMnemonicList: string[] = (
        await generateMnemonicAsync(256, undefined, words)
    ).split(' ')
    expect(testMnemonicList.length).toEqual(24)
    ownerSeed = await mnemonicToSeedAsync(testMnemonicList?.join(' '))
    const puzzle = seedToPuzzle(ownerSeed)
    expect(puzzle.hashHex().length).toEqual(64)

    const masterPrivateKey = PrivateKey.fromSeed(ownerSeed)
    const walletPrivateKey = Wallet.derivePrivateKey(masterPrivateKey)
    const walletPublicKey = walletPrivateKey.getG1()

    wallet = new Wallet(walletPublicKey, {
        hardened: true,
        index: 0,
    })
    const cat = new CAT(assetId, wallet)

    coinOwnerPuzzleHash = Program.fromBytes(cat.hash()).toHex()
})
test('Should create CAT TX SpendBundle without fee and check spendBundle is valid', async () => {
    const mockCoinList: Coin[] = [
        {
            amount: BigInt(100000000000),
            parent_coin_info:
                '0x000000000000000000000000000000000000000000000000000000000000001',
            puzzle_hash: coinOwnerPuzzleHash,
        },
    ]

    const spendAmount: string = '90000'

    const CATspendsList = await CAT.generateCATSpendList({
        wallet,
        assetId,
        amount: BigInt(spendAmount),
        memo: 'test',
        targetPuzzleHash: Program.fromBytes(
            addressInfo(testTargetAddress).hash
        ).toHex(),
        spendableCoinList: mockCoinList,
    })
    const CATsignatures = AugSchemeMPL.aggregate(
        CATspendsList.map((spend) =>
            Wallet.signCoinSpend(
                spend,
                Buffer.from(chains[1].agg_sig_me_additional_data, 'hex'),
                Wallet.derivePrivateKey(PrivateKey.fromSeed(ownerSeed)),
                Wallet.derivePrivateKey(PrivateKey.fromSeed(ownerSeed)).getG1()
            )
        )
    )

    const spendBundle = new SpendBundle(CATspendsList, CATsignatures)
    console.log('spendBundle', spendBundle)
    expect(spendBundle.aggregated_signature.isValid()).toBe(true)
    expect(spendBundle.destruct()).toBeArray()
})
/**
 * Should generate puzzle by Mnemonic
 * Should create CAT Tx valid SpendBundle without fee
 * Should create CAT Tx valid SpendBundle with fee and check spendBundle is valid
 */
