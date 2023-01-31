import {
    AugSchemeMPL,
    bigIntToBytes,
    concatBytes,
    fromHex,
    intToBytes,
    PrivateKey,
} from '@rigidity/bls-signatures'
import { Coin, ConditionOpcode, sanitizeHex } from '@rigidity/chia'
import { Program } from '@rigidity/clvm'
import { bech32m } from 'bech32'
import zlib from 'react-zlib-js'

import { getSpendableCoins } from '~/api/api'
import { OfferAsset, OfferParams } from '~/types/extension'
import Announcement from '~/utils/Announcement'
import { CAT } from '~/utils/CAT'
import CoinSpend from '~/utils/CoinSpend'
import { puzzles } from '~/utils/puzzles'
import Secure from '~/utils/Secure'
import SpendBundle from '~/utils/SpendBundle'
import { Wallet } from '~/utils/Wallet'

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

const generateSettlement = (assetId: string | undefined) => {
    if (assetId) {
        return new CAT(
            fromHex(sanitizeHex(assetId)),
            puzzles.settlementPaymentsOld
        )
    } else {
        return puzzles.settlementPaymentsOld
    }
}

const getNonce = () => {
    const nonceArr = new Uint8Array(256 / 8)
    // crypto.getRandomValues(nonceArr);
    return nonceArr
}

const toMsg = ({
    nonce,
    payment: { amount, memo, assetId },
    puzzle_hash,
}: {
    nonce: Uint8Array
    payment: OfferAsset
    puzzle_hash: string
}): Program => {
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

const getCoinList = async (puzzle_hash: string): Promise<Coin[]> => {
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
export class Offer {
    public bundle: SpendBundle

    constructor(bundle: SpendBundle) {
        this.bundle = bundle
    }

    getDictForVersion(ver: number) {
        return concatBytes(
            ...initDict.slice(0, ver).map((item) => fromHex(item))
        )
    }

    static async generateSecureBundle(
        announcements: Announcement[],
        offerPaymentList,
        fee = '0'
    ) {
        const seed = await Secure.getSeed()
        if (!seed) {
            throw new Error('')
        }
        const puzzleReveal = await Secure.getPuzzleReveal()
        if (!puzzleReveal) {
            throw new Error('')
        }
        const spendList: CoinSpend[] = []
        const announcementAssertions = announcements.map((announcement) =>
            Program.fromList([
                Program.fromHex(
                    sanitizeHex(ConditionOpcode.ASSERT_PUZZLE_ANNOUNCEMENT)
                ),
                Program.fromHex(announcement.name().toHex()),
            ])
        )
        for (let i = 0; i < offerPaymentList.length; i++) {
            const offerPayment = offerPaymentList[i]
            const settlement = generateSettlement(undefined)

            if (offerPayment.assetId) {
                const assetId = fromHex(offerPayment.assetId)

                const cat = new CAT(assetId, puzzleReveal)

                const masterPrivateKey = PrivateKey.fromSeed(seed)
                const walletPrivateKey =
                    Wallet.derivePrivateKey(masterPrivateKey)
                const walletPublicKey = walletPrivateKey.getG1()
                const innerPuzzle = new Wallet(walletPublicKey, {
                    hardened: true,
                    index: 0,
                })
                const CATCoinSpendList = await CAT.generateCATSpendList({
                    innerPuzzle,
                    amount: offerPayment.amount,
                    targetAddress: settlement.hashHex(),
                    spendableCoinList: await getCoinList(cat.hashHex()),
                    assetId,
                    additionalConditions: announcementAssertions,
                    memo: [offerPayment.memo],
                })

                spendList.push(...CATCoinSpendList)
            } else {
                const XCHSpendList = await Wallet.generateXCHSpendList({
                    fee,
                    amount: offerPayment.amount,
                    targetAddress: settlement.hashHex(),
                    puzzleReveal,
                    spendableCoinList: await getCoinList(
                        puzzleReveal.hashHex()
                    ),
                    additionalConditions: announcementAssertions,
                })
                spendList.push(...XCHSpendList)
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
export const createOffer = async (
    params: OfferParams,
    fee?: string
): Promise<string> => {
    const { requestAssets, offerAssets } = params
    const puzzleReveal = await Secure.getPuzzleReveal()
    if (!puzzleReveal) {
        throw new Error('error')
    }
    const requestPaymentAnnouncements: Announcement[] = requestAssets.map(
        (payment) => {
            const nonce = getNonce()
            const message = toMsg({
                nonce,
                payment,
                puzzle_hash: puzzleReveal?.hashHex(),
            })
            const settlement = generateSettlement(payment.assetId)
            return new Announcement(settlement.hashHex(), message)
        }
    )

    const secureBundle = await Offer.generateSecureBundle(
        requestPaymentAnnouncements,
        offerAssets,
        fee
    )
    console.log('secureBundle', secureBundle)
    const offer = new Offer(secureBundle)
    const offerString = offer.encode(5)
    console.log(offerString)
    return ''
}
