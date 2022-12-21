import {
    concatBytes,
    encodeInt,
    fromHex,
    hash256,
} from '@rigidity/bls-signatures'
import { addressInfo, Coin, ConditionOpcode, sanitizeHex } from '@rigidity/chia'
import { Program } from '@rigidity/clvm'

import {
    callGetBalance,
    getCoinRecordsByName,
    getPuzzleAndSolution,
} from '~/api/api'
import { catToMojo } from '~/utils/CoinConverter'

import CoinSpend from './CoinSpend'
import { puzzles } from './puzzles'
import { Primary, Wallet } from './Wallet'

export class CAT extends Program {
    constructor(tailPuzzleHash: Uint8Array, innerPuzzle: Program) {
        super(
            puzzles.cat.curry([
                Program.fromBytes(puzzles.cat.hash()),
                Program.fromBytes(tailPuzzleHash),
                innerPuzzle,
            ]).value
        )
    }

    static coinName = (coin: Coin) =>
        hash256(
            concatBytes(
                fromHex(sanitizeHex(coin.parent_coin_info)),
                fromHex(sanitizeHex(coin.puzzle_hash)),
                encodeInt(Number(coin.amount))
            )
        )

    static getLineageProof = async (childCoin: Coin): Promise<Program> => {
        const parentCoinRecord = await getCoinRecordsByName({
            data: {
                name: childCoin.parent_coin_info,
            },
        })

        const {
            coin_record: { coin, spent_block_index },
        } = parentCoinRecord.data
        const coinID = CAT.coinName(coin)
        const puzzleAndSolutionRecord = await getPuzzleAndSolution({
            data: {
                coin_id: Program.fromBytes(coinID).toHex(),
                height: Number(spent_block_index),
            },
        })
        const {
            data: {
                coin_solution: { puzzle_reveal },
            },
        } = puzzleAndSolutionRecord
        const unCurry = Program.deserializeHex(
            sanitizeHex(puzzle_reveal)
        ).uncurry()

        return Program.fromList([
            Program.fromHex(sanitizeHex(coin.parent_coin_info)),
            Program.fromHex(unCurry?.[1][2].hashHex() ?? ''),
            Program.fromBigInt(BigInt(coin.amount)),
        ])
    }

    static generateCATSpendList = async ({
        wallet,
        assetId,
        amount,
        memo,
        targetAddress,
        spendableCoinList,
    }): Promise<CoinSpend[]> => {
        const cat = new CAT(assetId, wallet)
        const spendAmount = BigInt(catToMojo(amount).toString())
        const {
            data: { data },
        } = await callGetBalance({
            puzzle_hash: Program.fromBytes(cat.hash()).toHex(),
        })

        if (BigInt(data) * BigInt(Math.pow(10, 3)) < spendAmount) {
            throw new Error("You don't have enough coin to spend")
        }

        const coinList = Wallet.selectCoins(spendableCoinList, spendAmount)

        const sumSpendingValue = coinList.reduce(
            (acc, cur) => BigInt(acc) + BigInt(cur.amount),
            0n
        )

        const change = sumSpendingValue - spendAmount

        const [firstCoin, ...restCoinList] = coinList

        const puzzlehash = Program.fromBytes(
            addressInfo(targetAddress).hash
        ).toHex()

        const primaryList: Primary[] = []
        primaryList.push({
            puzzlehash,
            amount: spendAmount,
            memos: [puzzlehash.toString(), memo],
        })
        if (BigInt(change) > 0) {
            primaryList.push({
                puzzlehash: sanitizeHex(wallet.hashHex()),
                amount: change,
            })
        }

        const conditionList: Program[] = primaryList.map((primary) =>
            Program.fromList([
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
        )

        const createCoinAnnouncementMsg = hash256(
            concatBytes(...coinList.map((coin) => CAT.coinName(coin)))
        )

        conditionList.push(
            Program.fromList([
                Program.fromHex(
                    sanitizeHex(ConditionOpcode.CREATE_COIN_ANNOUNCEMENT)
                ),
                Program.fromBytes(createCoinAnnouncementMsg),
            ])
        )
        const solution = Wallet.solutionForConditions(conditionList)
        interface SpendableCAT {
            coin: Coin
            innerPuzzle: Program
            innerSolution: Program
        }
        const spendableCATList: SpendableCAT[] = []
        spendableCATList.push({
            coin: firstCoin,
            innerPuzzle: wallet,
            innerSolution: solution,
        })
        const origin_info = this.coinName(firstCoin)

        const assertCoinAnnouncementMsg = hash256(
            concatBytes(origin_info, createCoinAnnouncementMsg)
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
        const innerSolution = Wallet.solutionForConditions(
            restCoinConditionList
        )
        for (const restCoin of restCoinList) {
            spendableCATList.push({
                coin: restCoin,
                innerPuzzle: wallet,
                innerSolution,
            })
        }

        const N = spendableCATList.length
        const spendsList: CoinSpend[] = []
        const deltaList: bigint[] = [
            BigInt(firstCoin.amount) - sumSpendingValue,
            ...restCoinList.map((coin) => BigInt(coin.amount)),
        ]

        let subtotalList: bigint[] = []
        let subtotal = 0n

        for (let i = 0; i < deltaList.length; i++) {
            subtotalList.push(subtotal)
            subtotal = deltaList[i] + subtotal
        }
        const subtotalOffset = BigInt(
            Math.min(...subtotalList.map((number) => Number(number)))
        )
        subtotalList = subtotalList.map((s) => s - subtotalOffset)

        for (let i = 0; i < N; i++) {
            const spendInfo = spendableCATList[i]
            const prevIndex = (i > 0 ? i - 1 : N + i - 1) % N
            const nextIndex = (i + 1) % N
            const prevId = CAT.coinName(spendableCATList[prevIndex].coin)
            const generateInfo = (coin) =>
                Program.fromList([
                    Program.fromHex(sanitizeHex(coin.parent_coin_info)),
                    Program.fromHex(sanitizeHex(coin.puzzle_hash)),
                    Program.fromBigInt(BigInt(coin.amount)),
                ])
            const getNextCoinProof = (coin) => {
                return Program.fromList([
                    Program.fromHex(sanitizeHex(coin.parent_coin_info)),
                    Program.fromHex(wallet.hashHex()),
                    Program.fromBigInt(BigInt(coin.amount)),
                ])
            }

            const myInfo = generateInfo(spendInfo.coin)
            const solution: Program[] = [
                spendInfo.innerSolution,
                await CAT.getLineageProof(spendInfo.coin),
                Program.fromHex(
                    sanitizeHex(Program.fromBytes(prevId).toString())
                ),
                myInfo,
                getNextCoinProof(spendableCATList[nextIndex].coin),
                Program.fromBigInt(subtotalList[i]),
                Program.fromInt(0),
            ]
            const coinSpend = new CoinSpend(
                spendInfo.coin,
                cat.serializeHex(),
                Program.fromList(solution).serializeHex()
            )
            spendsList.push(coinSpend)
        }
        return spendsList
    }
}
