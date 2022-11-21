import { PrivateKey } from '@rigidity/bls-signatures'
import { addressInfo, toAddress } from '@rigidity/chia'
import { Program } from '@rigidity/clvm'

import { puzzles } from './puzzles'
import { Wallet } from './Wallet'

export const getProgramBySeed = (seed: Uint8Array): Program => {
    const masterPrivateKey = PrivateKey.fromSeed(seed)
    const derivePrivateKey = Wallet.derivePrivateKey(masterPrivateKey)
    const derivePublicKey = derivePrivateKey.getG1()
    const program = puzzles.wallet.curry([
        Program.fromBytes(
            Wallet.syntheticPublicKey(
                derivePublicKey,
                Program.deserializeHex('ff0980').hash()
            ).toBytes()
        ),
    ])

    return program
}
export const seedToPuzzle = (seed: Uint8Array): Program => {
    return getProgramBySeed(seed)
}
export const seedToAddress = (seed: Uint8Array, prefix: string): string => {
    return toAddress(getProgramBySeed(seed).hash(), prefix)
}
export const addressToPuzzleHash = (address: string): string => {
    return Program.fromBytes(addressInfo(address).hash).toHex()
}
export const puzzleHashToAddress = (puzzleHash?: string, prefix = 'txch') => {
    if (!puzzleHash) return ''
    return toAddress(
        Program.fromHex(
            puzzleHash.startsWith('0x') ? puzzleHash.slice(2) : puzzleHash
        ).toBytes(),
        prefix
    )
}

export const validateAddress = (address?: string, prefix = 'xch') => {
    try {
        if (!address) return false
        const info = addressInfo(address)
        return info.hash.length === 32 && info.prefix === prefix
    } catch (error) {
        return false
    }
}
