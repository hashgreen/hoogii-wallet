import { Program } from '@rigidity/clvm'

import syntheticPublicKey from './puzzles/calculate_synthetic_public_key.clvm.hex.json'
import cat from './puzzles/cat.clvm.hex.json'
import catOld from './puzzles/cat_old.clvm.hex.json'
import nft_metadata_updater_default from './puzzles/nft_metadata_updater_default.clvm.hex.json'
import nft_ownership_layer from './puzzles/nft_ownership_layer.clvm.hex.json'
import nft_ownership_transfer_program_one_way_claim_with_royalties from './puzzles/nft_ownership_transfer_program_one_way_claim_with_royalties.clvm.hex.json'
import nft_state_layer from './puzzles/nft_state_layer.clvm.hex.json'
import payToConditions from './puzzles/p2_conditions.clvm.hex.json'
import wallet from './puzzles/p2_delegated_puzzle_or_hidden_puzzle.clvm.hex.json'
import settlementPayments from './puzzles/settlement_payments.clvm.hex.json'
import settlementPaymentsOld from './puzzles/settlement_payments_old.clvm.hex.json'
import singleton_top_layer_v1_1 from './puzzles/singleton_top_layer_v1_1.clvm.hex.json'

export const puzzles = {
    wallet: Program.deserializeHex(wallet.hex),
    cat: Program.deserializeHex(cat.hex),
    catOld: Program.deserializeHex(catOld.hex),
    syntheticPublicKey: Program.deserializeHex(syntheticPublicKey.hex),
    defaultHidden: Program.deserializeHex('ff0980'),
    payToConditions: Program.deserializeHex(payToConditions.hex),
    singletonTopLayerV1: Program.deserializeHex(singleton_top_layer_v1_1.hex),
    // NFT
    nftStateLayer: Program.deserializeHex(nft_state_layer.hex),
    nftOwnershipLayer: Program.deserializeHex(nft_ownership_layer.hex),
    nftMetadataUpdaterDefault: Program.deserializeHex(
        nft_metadata_updater_default.hex
    ),
    nftOwnershipTransferProgramOneWayClaimWithRoyalties: Program.deserializeHex(
        nft_ownership_transfer_program_one_way_claim_with_royalties.hex
    ),
    // OFFER
    settlementPaymentsOld: Program.deserializeHex(settlementPaymentsOld.hex),
    settlementPayments: Program.deserializeHex(settlementPayments.hex),
    test: Program.deserializeHex('8b4142434445464748494a4b'),
}
