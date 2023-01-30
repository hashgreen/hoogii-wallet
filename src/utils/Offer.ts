import {
    bigIntToBytes,
    concatBytes,
    fromHex,
    intToBytes,
} from '@rigidity/bls-signatures'
import { sanitizeHex } from '@rigidity/chia'
import { Program } from '@rigidity/clvm'
import { bech32m } from 'bech32'
import zlib from 'zlib'

import { puzzles } from './puzzles'
import SpendBundle from './SpendBundle'

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
        const def = zlib.deflateSync(offerName, {
            dictionary: this.getDictForVersion(ver),
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
