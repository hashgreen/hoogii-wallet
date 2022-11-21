export const bytesToString = (bytes): string => {
    return Buffer.from(bytes).toString('base64')
}
export const stringToBytes = (str): Uint8Array => {
    return Buffer.from(str, 'base64')
}
const keysFromPassword = async (salt: Uint8Array, password: string) => {
    const enc: Uint8Array = new TextEncoder().encode(password)
    const basekey = await crypto.subtle.importKey('raw', enc, 'PBKDF2', false, [
        'deriveBits',
    ])

    const keys = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            hash: 'SHA-512',
            salt,
            iterations: 1e5,
        },
        basekey,
        256 /* key */ + 128 /* iv */
    )

    const iv: Uint8Array = new Uint8Array(keys.slice(32))

    const key = await crypto.subtle.importKey(
        'raw',
        new Uint8Array(keys.slice(0, 32)),
        { name: 'AES-GCM' },
        false,
        ['decrypt', 'encrypt']
    )

    return { key, iv }
}

export const encrypt = async (
    password: string,
    plainText: string
): Promise<{
    salt: string
    cipherText: string
}> => {
    const salt: Uint8Array = new Uint8Array(32)
    const aesParams = await keysFromPassword(
        crypto.getRandomValues(salt),
        password
    )

    const cipherText = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: aesParams.iv },
        aesParams.key,
        new TextEncoder().encode(plainText)
    )
    return { salt: bytesToString(salt), cipherText: bytesToString(cipherText) }
}

export const decrypt = async (
    salt: string,
    password: string,
    cipherText: string
): Promise<string> => {
    const aesParams = await keysFromPassword(stringToBytes(salt), password)

    const plainText = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: aesParams.iv },
        aesParams.key,
        new Uint8Array(stringToBytes(cipherText))
    )
    return new TextDecoder().decode(plainText)
}

// async function runTest() {
//     // for testing
//     const encrypted = await encrypt('p455w0rd', 'original text')
//     console.log('encrypted', encrypted)

//     const decrypted = await decrypt(
//         encrypted.salt,
//         'p455w0rd',
//         encrypted.cipherText
//     )
//     console.log('decrypted', decrypted)
// }
