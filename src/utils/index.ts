import { hash256 } from '@rigidity/bls-signatures'
import { Program } from '@rigidity/clvm'
import bcrypt from 'bcryptjs'



export const shortenHash = (
    hash: string,
    head: number = 5,
    tail: number = 7,
    separator = '...'
) => {
    if (head + tail >= hash.length) return hash
    return `${hash.slice(0, head)}${separator}${hash.slice(-tail)}`
}

export const enumArray = <T extends Record<string, string | number>>(
    enumerable: T
) =>
    (
        Object.keys(enumerable).filter((item) => isNaN(Number(item))) as Array<
            keyof typeof enumerable
        >
    ).map((o) => enumerable[o])

export const sha256 = (data: string) =>
    Program.fromBytes(hash256(new TextEncoder().encode(data))).toHex()
export const bcryptHash = (plainText: string): Promise<string> =>
    bcrypt.hash(plainText, 10)
export const bcryptVerify = (
    plainText: string,
    hash: string
): Promise<boolean> => bcrypt.compare(plainText, hash)
