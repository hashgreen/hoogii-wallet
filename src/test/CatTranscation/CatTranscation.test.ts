import { AugSchemeMPL, fromHex, PrivateKey } from '@rigidity/bls-signatures'
import { addressInfo, sanitizeHex } from '@rigidity/chia'
import { Program } from '@rigidity/clvm'
import { generateMnemonicAsync, mnemonicToSeedAsync } from 'bip39-web'

import { CAT } from '~/utils/CAT'
import { seedToPuzzle } from '~/utils/signature'
import SpendBundle from '~/utils/SpendBundle'
import { Coin } from '~/utils/Wallet/types'
import { Wallet } from '~/utils/Wallet/Wallet'

import words from '../../../config/wordlist_en.json'

let ownerSeed: Uint8Array
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let coinOwnerPuzzleHash: string = ''
let wallet
const testTargetAddress =
    'txch17ynqsq33sthdx69qehtqcunnh3w36t04arlgpw4wjrkfns6twljs6y0ck3'
const assetId = fromHex(
    '73dd418ff67e6079f06c7cc8cee637c7adc314210dca26997d634692f6c16087'
)
const mockCoin = {
    amount: 100000n,
    parent_coin_info:
        '0x1291c994f85f3aa91e04de633c6e783a23b2dec940fb8d78981cfdeed9326b82',
    puzzle_hash:
        '0xd85ac735b59ff2cb3b9f6eef8643f881cc986fbb02ecb9d00c9d9fe2583d2272',
}

const mockParentCoin = {
    amount: 100000n,
    parent_coin_info:
        '0x279bf853b68dd3ef4bf7a4a609e7f81e51a2350db463319f6825b235e8960626',
    puzzle_hash:
        '0xcf3f7a8850dc7c27990b3e9e77c436f53a787dfb54683f8cb9e23ee6b26618ef',
}

test('Should generate puzzle by Mnemonic', async () => {
    const testMnemonicList: string[] = (
        await generateMnemonicAsync(256, undefined, words)
    ).split(' ')

    expect(testMnemonicList.length).toEqual(24)
    ownerSeed = await mnemonicToSeedAsync(
        'reform unaware fold autumn zoo napkin frame vital funny filter purse mammal license thumb coyote lizard merit crazy van brown worth eager barrel front'
    )

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
    const mockCoinList: Coin[] = [mockCoin]
    const getLineageProof = async () => {
        return Program.fromList([
            Program.fromHex(sanitizeHex(mockParentCoin.parent_coin_info)),
            Program.fromHex(sanitizeHex(mockParentCoin.puzzle_hash)),
            Program.fromBigInt(mockParentCoin.amount),
        ])
    }

    const spendAmount: bigint = 100000n

    const CATspendsList = await CAT.generateCATSpendList({
        wallet,
        assetId,
        amount: spendAmount,
        memos: ['test'],
        targetPuzzleHash: Program.fromBytes(
            addressInfo(testTargetAddress).hash
        ).toHex(),
        spendableCoinList: mockCoinList,
        lineageProof: getLineageProof,
    })

    const CATsignatures = AugSchemeMPL.aggregate(
        CATspendsList.map((spend) => {
            return Wallet.signCoinSpend(
                spend,
                Buffer.from(
                    'ae83525ba8d1dd3f09b277de18ca3e43fc0af20d20c4b3e92ef2a48bd291ccb2',
                    'hex'
                ),
                Wallet.derivePrivateKey(PrivateKey.fromSeed(ownerSeed)),
                Wallet.derivePrivateKey(PrivateKey.fromSeed(ownerSeed)).getG1()
            )
        })
    )
    const signatureList = [CATsignatures]
    const spendBundle = new SpendBundle(
        CATspendsList,
        AugSchemeMPL.aggregate(signatureList)
    )

    expect(spendBundle.aggregated_signature.isValid()).toBe(true)
    expect(spendBundle.destruct()).toBeArray()
})
/**
 * Should generate puzzle by Mnemonic
 * Should create CAT Tx valid SpendBundle without fee
 * Should create CAT Tx valid SpendBundle with fee and check spendBundle is valid
 */
