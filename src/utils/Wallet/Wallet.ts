import {
    AugSchemeMPL,
    bigIntToBytes,
    bytesToBigInt,
    concatBytes,
    encodeInt,
    fromHex,
    hash256,
    JacobianPoint,
    PrivateKey,
} from '@rigidity/bls-signatures'
import { ConditionOpcode, sanitizeHex } from '@rigidity/chia'
import { Program } from '@rigidity/clvm'

import CoinSelect from '../CoinSelect'
import CoinSpend from '../CoinSpend'
import { puzzles } from '../puzzles'
import { Coin, XCHPayload } from './types'

const defaultHiddenPuzzleHash = puzzles.defaultHidden.hash()

const groupOrder =
    0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001n

export interface Derivation {
    readonly hardened: boolean
    readonly index: number
}

export interface Primary {
    puzzlehash: string
    amount: bigint
    memos?: string[]
}

export class Wallet extends Program {
    public readonly publicKey: JacobianPoint
    public readonly derivation: Derivation

    constructor(publicKey: JacobianPoint, derivation: Derivation) {
        super(
            puzzles.wallet.curry([
                Program.fromBytes(
                    Wallet.syntheticPublicKey(
                        publicKey,
                        defaultHiddenPuzzleHash
                    ).toBytes()
                ),
            ]).value
        )
        this.publicKey = publicKey
        this.derivation = derivation
    }

    static coinName = (coin: Coin) =>
        hash256(
            concatBytes(
                fromHex(sanitizeHex(coin.parent_coin_info)),
                fromHex(sanitizeHex(coin.puzzle_hash)),
                encodeInt(Number(coin.amount))
            )
        )

    public static signCoinSpend(
        coinSpend: CoinSpend,
        aggSigMeExtraData: Uint8Array,
        privateKey: PrivateKey,
        walletPublicKey: JacobianPoint,
        keyPairs: Map<JacobianPoint, PrivateKey> = new Map()
    ): JacobianPoint {
        if (!privateKey.getG1().equals(walletPublicKey)) {
            throw new Error('Incorrect private key.')
        }
        const signatures: Array<JacobianPoint> = []
        const finalKeyPairs = new Map(keyPairs)
        const syntheticPublicKey = Wallet.syntheticPublicKey(
            walletPublicKey,
            defaultHiddenPuzzleHash
        )

        const syntheticPrivateKey = Wallet.syntheticPrivateKey(
            privateKey,
            defaultHiddenPuzzleHash
        )
        finalKeyPairs.set(syntheticPublicKey, syntheticPrivateKey)

        const conditions = Program.deserializeHex(
            sanitizeHex(coinSpend.puzzle_reveal)
        )
            .run(Program.deserializeHex(sanitizeHex(coinSpend.solution)))
            .value.toList()
        const pairs: Array<[JacobianPoint, Uint8Array]> = []
        for (const item of conditions.filter(
            (condition) =>
                condition.first.isAtom &&
                [49, 50].includes(condition.first.toInt())
        )) {
            const condition = item.toList()
            if (condition.length !== 3) {
                throw new Error('Invalid condition length.')
            } else if (
                !condition[1].isAtom ||
                condition[1].atom.length !== 48
            ) {
                throw new Error('Invalid public key.')
            } else if (
                !condition[2].isAtom ||
                condition[2].atom.length > 1024
            ) {
                throw new Error('Invalid message.')
            }

            pairs.push([
                JacobianPoint.fromBytesG1(condition[1].atom),
                concatBytes(
                    condition[2].atom,
                    ...(condition[0].toInt() === 49
                        ? []
                        : [this.coinName(coinSpend.coin), aggSigMeExtraData])
                ),
            ])
        }
        const pks: JacobianPoint[] = []
        const messages: Uint8Array[] = []
        for (const [publicKey, message] of pairs) {
            let privateKey: PrivateKey | null = null
            for (const keyPair of finalKeyPairs) {
                if (keyPair[0].equals(publicKey)) privateKey = keyPair[1]
                pks.push(publicKey)
            }
            if (!privateKey) {
                throw new Error(
                    `Could not find private key for ${publicKey.toHex()}.`
                )
            }
            messages.push(message)
            const signature = AugSchemeMPL.sign(privateKey, message)
            signatures.push(signature)
        }
        return AugSchemeMPL.aggregate(signatures)
    }

    public static solutionForConditions(conditions: Program[]): Program {
        const delegatedPuzzle = puzzles.payToConditions.run(
            Program.fromList([Program.fromList(conditions)])
        ).value
        return Program.fromList([Program.nil, delegatedPuzzle, Program.nil])
    }

    public static derivePrivateKey(masterPrivateKey: PrivateKey): PrivateKey {
        return Wallet.derivePrivateKeyPath(
            masterPrivateKey,
            [12381, 8444, 2, 0],
            true
        )
    }

    public static derivePublicKey(
        masterPublicKey: JacobianPoint,
        index: number
    ): JacobianPoint {
        return Wallet.derivePublicKeyPath(masterPublicKey, [
            12381,
            8444,
            2,
            index,
        ])
    }

    public static syntheticPublicKey(
        publicKey: JacobianPoint,
        hiddenPuzzleHash: Uint8Array
    ): JacobianPoint {
        return JacobianPoint.fromBytes(
            puzzles.syntheticPublicKey.run(
                Program.fromList([
                    Program.fromBytes(publicKey.toBytes()),
                    Program.fromBytes(hiddenPuzzleHash),
                ])
            ).value.atom,
            false
        )
    }

    public static syntheticPrivateKey(
        privateKey: PrivateKey,
        hiddenPuzzleHash: Uint8Array
    ): PrivateKey {
        const privateExponent = bytesToBigInt(privateKey.toBytes(), 'big')
        const publicKey = privateKey.getG1()

        const syntheticOffset = Wallet.syntheticOffset(
            publicKey,
            hiddenPuzzleHash
        )
        const syntheticPrivateExponent =
            (privateExponent + syntheticOffset) % groupOrder
        const blob = bigIntToBytes(syntheticPrivateExponent, 32, 'big')
        return PrivateKey.fromBytes(blob)
    }

    public static syntheticOffset(
        publicKey: JacobianPoint,
        hiddenPuzzleHash: Uint8Array
    ): bigint {
        const blob = hash256(concatBytes(publicKey.toBytes(), hiddenPuzzleHash))
        const result = bytesToBigInt(blob, 'big', true)
        return result > 0n
            ? result % groupOrder
            : (result % groupOrder) + groupOrder
    }

    public static derivePrivateKeyPath(
        privateKey: PrivateKey,
        path: number[],
        hardened: boolean
    ): PrivateKey {
        for (const index of path) {
            privateKey = (
                hardened
                    ? AugSchemeMPL.deriveChildSk
                    : AugSchemeMPL.deriveChildSkUnhardened
            )(privateKey, index)
        }
        return privateKey
    }

    public static derivePublicKeyPath(
        publicKey: JacobianPoint,
        path: number[]
    ): JacobianPoint {
        for (const index of path) {
            publicKey = AugSchemeMPL.deriveChildPkUnhardened(publicKey, index)
        }
        return publicKey
    }

    public static selectCoins(
        spendableCoinList: Coin[],
        spendAmount: bigint
    ): Coin[] {
        const matchCoin = spendableCoinList.find(
            (coin) => BigInt(coin.amount) === spendAmount
        )
        if (matchCoin) {
            return [matchCoin]
        }
        const { coins: usedCoinList } = CoinSelect(
            spendableCoinList.map((coin) => ({
                ...coin,
                amount: BigInt(coin.amount),
            })),
            [
                {
                    amount: spendAmount,
                    parent_coin_info: '',
                    puzzle_hash: '',
                },
            ],
            0n // feerate
        )

        return usedCoinList || []
    }

    static generateXCHSpendList = async ({
        puzzle,
        amount,
        fee = 0n,
        targetPuzzleHash,
        spendableCoinList,
        memo = '',
        additionalConditions = [],
    }: XCHPayload): Promise<CoinSpend[]> => {
        const spendAmount = amount + fee

        const coinList = Wallet.selectCoins(spendableCoinList, spendAmount)
        const sumSpendingValue = coinList.reduce((acc, cur) => {
            return acc + cur.amount
        }, 0n)

        const change = sumSpendingValue - spendAmount

        const [firstCoin, ...restCoinList] = coinList
        const primaryList: Primary[] = []

        if (amount > 0n) {
            primaryList.push({
                puzzlehash: targetPuzzleHash,
                amount,
                memos: [memo],
            })
        }

        // memo is unnecessary for change
        primaryList.push({
            puzzlehash: sanitizeHex(firstCoin.puzzle_hash), // change's puzzlehash
            amount: change, // memo is unnecessary for change
        })

        const conditionList: Program[] = primaryList.map((primary) => {
            return Program.fromList([
                Program.fromHex(sanitizeHex(ConditionOpcode.CREATE_COIN)),
                Program.fromHex(primary.puzzlehash),
                Program.fromBigInt(primary.amount),
                ...(primary.memos
                    ? [
                          Program.fromList(
                              primary.memos.map((memo) =>
                                  Program.fromText(memo)
                              )
                          ),
                      ]
                    : []),
            ])
        })

        if (fee > 0n) {
            conditionList.push(
                Program.fromList([
                    Program.fromHex(sanitizeHex(ConditionOpcode.RESERVE_FEE)),
                    Program.fromBigInt(fee),
                ])
            )
        }

        const origin_info = this.coinName(firstCoin)
        const createCoinAnnouncement = hash256(
            concatBytes(
                ...coinList.map((coin) => this.coinName(coin)),
                ...primaryList.map((primary) =>
                    this.coinName({
                        ...primary,
                        puzzle_hash: primary.puzzlehash,
                        amount: primary.amount,
                        parent_coin_info:
                            Program.fromBytes(origin_info).toString(),
                    })
                )
            )
        )

        conditionList.push(
            Program.fromList([
                Program.fromHex(
                    sanitizeHex(ConditionOpcode.CREATE_COIN_ANNOUNCEMENT)
                ),
                Program.fromBytes(createCoinAnnouncement),
            ])
        )
        conditionList.push(...additionalConditions)

        const solution = Wallet.solutionForConditions(conditionList)

        const spendsList: CoinSpend[] = []
        const coinSpend = new CoinSpend(
            firstCoin,
            puzzle.serializeHex(),
            solution.serializeHex()
        )
        spendsList.push(coinSpend)
        const assertCoinAnnouncementMsg = hash256(
            concatBytes(origin_info, createCoinAnnouncement)
        )
        const restCoinConditionList: Program[] = []
        restCoinConditionList.push(
            Program.fromList([
                Program.fromHex(
                    sanitizeHex(ConditionOpcode.ASSERT_COIN_ANNOUNCEMENT)
                ),
                Program.fromBytes(assertCoinAnnouncementMsg),
            ])
        )
        const restSolution = Wallet.solutionForConditions(
            restCoinConditionList
        ).serializeHex()
        for (const restCoin of restCoinList) {
            const coinSpend = new CoinSpend(
                restCoin,
                puzzle.serializeHex(),
                restSolution
            )
            spendsList.push(coinSpend)
        }
        return spendsList
    }
}
