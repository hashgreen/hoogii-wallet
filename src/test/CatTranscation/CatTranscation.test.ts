import { AugSchemeMPL, fromHex, PrivateKey } from '@rigidity/bls-signatures'
import { addressInfo } from '@rigidity/chia'
import { Program } from '@rigidity/clvm'
import { generateMnemonicAsync, mnemonicToSeedAsync } from 'bip39-web'

import { ChainEnum } from '~/types/chia'
import { CAT } from '~/utils/CAT'
import { chains } from '~/utils/constants'
import SpendBundle from '~/utils/SpendBundle'

import words from '../../../config/wordlist_en.json'
import { seedToPuzzle } from '../../utils/signature'
import { Coin } from '../../utils/Wallet/types'
import { Wallet } from '../../utils/Wallet/Wallet'

let ownerSeed: Uint8Array
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            amount: 1000000n,
            parent_coin_info:
                '0x50cb079754673b70da42f22045cb59695b87fff36c9e7c0deec703955db58282',
            puzzle_hash: coinOwnerPuzzleHash,
        },
    ]
    const getLineageProof = async (childCoin: Coin) => {
        await setTimeout(() => {}, 1000)
        console.log('BigInt(childCoin.amount)', BigInt(childCoin.amount))
        return Program.fromList([
            Program.fromHex(
                '7a4608c5ad31740b5e1f1b7e4c847717f91fa6c9e281e538540f01e246c5bfce'
            ),
            Program.fromHex(
                '068a63ece551c597be7c86d06186c3fc2a8c5a760a89a1f00d0d7226f1490c3b'
            ),
            Program.fromBigInt(BigInt(childCoin.amount)),
        ])
    }

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
        lineageProof: getLineageProof,
    })
    const CATsignatures = AugSchemeMPL.aggregate(
        CATspendsList.map((spend) =>
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

    const spendBundle = new SpendBundle(CATspendsList, CATsignatures)

    expect(spendBundle.aggregated_signature.isValid()).toBe(true)
    expect(spendBundle.destruct()).toBeArray()
})
/**
 * Should generate puzzle by Mnemonic
 * Should create CAT Tx valid SpendBundle without fee
 * Should create CAT Tx valid SpendBundle with fee and check spendBundle is valid
 */
