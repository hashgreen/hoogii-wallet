import {
    bigIntToBytes,
    concatBytes,
    fromHex,
    hash256,
    intToBytes,
    JacobianPoint,
} from '@rigidity/bls-signatures'
import { sanitizeHex } from '@rigidity/chia'
import { Program } from '@rigidity/clvm'

import CoinSpend from './CoinSpend'

class SpendBundle {
    public readonly coin_spends: CoinSpend[]
    public readonly aggregated_signature: JacobianPoint
    constructor(coin_spends: CoinSpend[], aggregated_signature: JacobianPoint) {
        this.coin_spends = coin_spends
        this.aggregated_signature = aggregated_signature
    }

    getObj() {
        return {
            coin_spends: this.coin_spends,
            aggregated_signature: this.aggregated_signature.toHex(),
        }
    }

    getTXID(): string {
        return Program.fromBytes(
            hash256(
                concatBytes(
                    intToBytes(this.coin_spends.length, 4, 'big'),
                    concatBytes(
                        ...this.coin_spends.map((spend) =>
                            concatBytes(
                                concatBytes(
                                    fromHex(
                                        sanitizeHex(spend.coin.parent_coin_info)
                                    ),
                                    fromHex(
                                        sanitizeHex(spend.coin.puzzle_hash)
                                    ),
                                    bigIntToBytes(
                                        BigInt(spend.coin.amount),
                                        8,
                                        'big'
                                    )
                                ),
                                fromHex(spend.puzzle_reveal),
                                fromHex(spend.solution)
                            )
                        )
                    )
                )
            )
        ).toHex()
    }
}
export default SpendBundle
