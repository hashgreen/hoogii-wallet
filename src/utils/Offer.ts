import {
    AugSchemeMPL,
    bigIntToBytes,
    concatBytes,
    fromHex,
    intToBytes,
    PrivateKey,
} from '@rigidity/bls-signatures'
import { ConditionOpcode, sanitizeHex } from '@rigidity/chia'
import { Program } from '@rigidity/clvm'
import { bech32m } from 'bech32'
import zlib from 'react-zlib-js'

import { callGetBalance, getSpendableCoins } from '~/api/api'
import { OfferAsset } from '~/types/extension'
import Announcement from '~/utils/Announcement'
import { CAT } from '~/utils/CAT'
import CoinSpend from '~/utils/CoinSpend'
import { puzzles } from '~/utils/puzzles'
import Secure from '~/utils/Secure'
import SpendBundle from '~/utils/SpendBundle'
import type { Coin } from '~/utils/Wallet/types'
import { Wallet } from '~/utils/Wallet/Wallet'

const initDict = [
    puzzles.wallet.serializeHex() + puzzles.catOld.serializeHex(),
    puzzles.settlementPaymentsOld.serializeHex(),
    puzzles.singletonTopLayerV1.serializeHex() +
        puzzles.nftStateLayer.serializeHex() +
        puzzles.nftOwnershipLayer.serializeHex() +
        puzzles.nftMetadataUpdaterDefault.serializeHex() +
        puzzles.nftOwnershipTransferProgramOneWayClaimWithRoyalties.serializeHex(),

    puzzles.cat.serializeHex(),
    puzzles.settlementPayments.serializeHex(),
]
export default class Offer {
    public bundle: SpendBundle

    constructor(bundle: SpendBundle) {
        this.bundle = bundle
    }

    getDictForVersion(ver: number) {
        return concatBytes(
            ...initDict.slice(0, ver).map((item) => fromHex(item))
        )
    }

    static async getCoinList(puzzle_hash: string): Promise<Coin[]> {
        const res = await getSpendableCoins({
            puzzle_hash,
        })

        return (
            res?.data?.data?.map((record) => ({
                ...record.coin,
                amount: record.coin.amount || 0,
            })) ?? []
        )
    }

    static toMsg = ({
        payment: { amount, memo, assetId },
        puzzle_hash,
    }: {
        payment: OfferAsset
        puzzle_hash: string
    }): Program => {
        const nonce = this.getNonce()
        return Program.fromList([
            Program.fromBytes(nonce),
            Program.fromList([
                Program.fromHex(sanitizeHex(puzzle_hash)),
                Program.fromBigInt(
                    BigInt(Number(amount) * Math.pow(10, assetId ? 3 : 12))
                ),
                Program.fromList([Program.fromText(memo || '')]),
            ]),
        ])
    }

    static getNonce = () => {
        const nonceArr = new Uint8Array(256 / 8)

        return nonceArr
    }

    static generateSettlement = (assetId: string | undefined) => {
        if (assetId) {
            return new CAT(
                fromHex(sanitizeHex(assetId)),
                puzzles.settlementPaymentsOld
            )
        } else {
            return puzzles.settlementPaymentsOld
        }
    }

    static async createCoinSpend() {}

    static async generateSecureBundle(
        requestAssets: OfferAsset[],
        offerPaymentList: OfferAsset[],
        fee: string = '0'
    ) {
        // verify is unlock
        const seed = await Secure.getSeed()
        if (!seed) {
            throw new Error('Can not find secret')
        }
        const puzzleReveal = await Secure.getPuzzleReveal()
        if (!puzzleReveal) {
            throw new Error('Can not find public key')
        }

        const requestPaymentAnnouncements: Announcement[] = requestAssets.map(
            (payment) => {
                const message = Offer.toMsg({
                    payment,
                    puzzle_hash: puzzleReveal.hashHex(),
                })

                const settlement = Offer.generateSettlement(payment.assetId)
                return new Announcement(settlement.hashHex(), message)
            }
        )
        // bind coinSpend
        const spendList: CoinSpend[] = []
        requestAssets.forEach(({ assetId, amount, memo }) => {
            const coin: Coin = {
                parent_coin_info:
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                puzzle_hash: this.generateSettlement(assetId).hashHex(),
                amount: 0n,
            }
            const nonce = this.getNonce()
            if (assetId) {
                const settlementSolution = Program.fromList([
                    Program.fromList([
                        Program.fromBytes(nonce),
                        Program.fromList([
                            Program.fromHex(
                                sanitizeHex(puzzleReveal.hashHex())
                            ),
                            Program.fromBigInt(BigInt(amount)),
                            Program.fromList([Program.fromText(memo || '')]),
                        ]),
                    ]),
                ])

                const coinSpend = new CoinSpend(
                    coin,
                    this.generateSettlement(assetId).serializeHex(),
                    settlementSolution.serializeHex()
                )
                spendList.push(coinSpend)
            } else {
                const settlementSolution = Program.fromList([
                    Program.fromList([
                        Program.fromBytes(nonce),
                        Program.fromList([
                            Program.fromHex(
                                sanitizeHex(puzzleReveal.hashHex())
                            ),
                            Program.fromBigInt(BigInt(amount)),
                            Program.fromList([]),
                        ]),
                    ]),
                ])

                const coinSpend = new CoinSpend(
                    coin,
                    this.generateSettlement(undefined).serializeHex(),
                    settlementSolution.serializeHex()
                )
                spendList.push(coinSpend)
            }
        })

        const announcementAssertions = requestPaymentAnnouncements.map(
            (announcement) =>
                Program.fromList([
                    Program.fromHex(
                        sanitizeHex(ConditionOpcode.ASSERT_PUZZLE_ANNOUNCEMENT)
                    ),
                    Program.fromHex(announcement.name().toHex()),
                ])
        )
        for (let i = 0; i < offerPaymentList.length; i++) {
            const offerPayment = offerPaymentList[i]
            const settlement = this.generateSettlement(undefined)

            if (offerPayment.assetId) {
                const assetId = fromHex(offerPayment.assetId)

                const cat = new CAT(assetId, puzzleReveal)

                const masterPrivateKey = PrivateKey.fromSeed(seed)
                const walletPrivateKey =
                    Wallet.derivePrivateKey(masterPrivateKey)
                const walletPublicKey = walletPrivateKey.getG1()
                const wallet = new Wallet(walletPublicKey, {
                    hardened: true,
                    index: 0,
                })
                const {
                    data: { data },
                } = await callGetBalance({
                    puzzle_hash: Program.fromBytes(cat.hash()).toHex(),
                })

                if (BigInt(data) < BigInt(offerPayment.amount)) {
                    throw new Error("You don't have enough coin to spend")
                }
                console.log('settlement.hashHex()', settlement.hashHex())
                const CATCoinSpendList = await CAT.generateCATSpendList({
                    wallet,
                    amount: BigInt(offerPayment.amount),
                    targetPuzzleHash: settlement.hashHex(),
                    spendableCoinList: await this.getCoinList(cat.hashHex()),
                    assetId,
                    additionalConditions: announcementAssertions,
                    memo: offerPayment.memo,
                })

                spendList.push(...CATCoinSpendList)
            } else {
                const XCHSpendList = await Wallet.generateXCHSpendList({
                    fee: 0n,
                    amount: BigInt(offerPayment.amount),
                    targetPuzzleHash: settlement.hashHex(),
                    puzzle: puzzleReveal,
                    spendableCoinList: await this.getCoinList(
                        puzzleReveal.hashHex()
                    ),
                    additionalConditions: announcementAssertions,
                })
                spendList.push(...XCHSpendList)
            }

            if (BigInt(fee) > 0n) {
                const feeSpendList = await Wallet.generateXCHSpendList({
                    fee: BigInt(fee),
                    amount: 0n,
                    targetPuzzleHash: settlement.hashHex(),
                    puzzle: puzzleReveal,
                    spendableCoinList: await this.getCoinList(
                        puzzleReveal.hashHex()
                    ),
                    additionalConditions: announcementAssertions,
                })
                spendList.push(...feeSpendList)
            }
        }

        const signatures = AugSchemeMPL.aggregate(
            spendList
                .filter((spend) => spend.coin.amount)
                .map((item) =>
                    Wallet.signCoinSpend(
                        item,
                        Buffer.from(
                            'ae83525ba8d1dd3f09b277de18ca3e43fc0af20d20c4b3e92ef2a48bd291ccb2',
                            'hex'
                        ),
                        Wallet.derivePrivateKey(PrivateKey.fromSeed(seed)),
                        Wallet.derivePrivateKey(
                            PrivateKey.fromSeed(seed)
                        ).getG1()
                    )
                )
        )
        const spendBundle = new SpendBundle(spendList, signatures)
        return spendBundle
    }

    getId() {
        return this.bundle.getTXID()
    }

    encode(ver: number, prefix = 'offer') {
        const offerName = concatBytes(
            intToBytes(this.bundle.coin_spends.length, 4, 'big'),
            ...this.bundle.coin_spends.map((coinSpend) =>
                concatBytes(
                    fromHex(sanitizeHex(coinSpend.coin.parent_coin_info)),
                    fromHex(sanitizeHex(coinSpend.coin.puzzle_hash)),
                    bigIntToBytes(BigInt(coinSpend.coin.amount), 8, 'big'),
                    fromHex(sanitizeHex(coinSpend.puzzle_reveal)),
                    fromHex(sanitizeHex(coinSpend.solution))
                )
            ),
            Program.fromHex(
                sanitizeHex(this.bundle.aggregated_signature.toHex())
            ).toBytes()
        )

        const def = zlib.deflateSync(Buffer.from(offerName), {
            dictionary: Buffer.from(this.getDictForVersion(ver)),
        })

        const final_buff = concatBytes(intToBytes(ver, 2, 'big'), def)
        const words = bech32m.toWords(final_buff)
        const encoded = bech32m.encode(
            prefix,
            words,
            prefix.length + 7 + words.length
        )

        return encoded
    }

    static decode(offerString: string) {
        const offer_compressed = bech32m.decode(offerString).words
        console.log('offer_compressed>', offer_compressed)
    }
}
