import { Program } from '@rigidity/clvm'

import syntheticPublicKey from './puzzles/calculate_synthetic_public_key.clvm.hex.json'
import cat from './puzzles/cat.clvm.hex.json'
import payToConditions from './puzzles/p2_conditions.clvm.hex.json'
import wallet from './puzzles/p2_delegated_puzzle_or_hidden_puzzle.clvm.hex.json'

export const puzzles = {
    wallet: Program.deserializeHex(wallet.hex),
    syntheticPublicKey: Program.deserializeHex(syntheticPublicKey.hex),
    defaultHidden: Program.deserializeHex('ff0980'),
    payToConditions: Program.deserializeHex(payToConditions.hex),
    cat: Program.deserializeHex(cat.hex),
}
