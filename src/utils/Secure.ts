import { PrivateKey } from '@rigidity/bls-signatures'

import { getDataFromMemory } from '~/api/extension'
import { getStorage } from '~/utils/extension/storage'
import { getProgramBySeed } from '~/utils/signature'

import { retrieveSeed } from './extension'
import { Wallet } from './Wallet/Wallet'

class Secure {
    static getSeed = async () => {
        const keyring = await getStorage('keyring')
        if (!keyring) {
            throw new Error('keyring is not exist')
        }
        const password = await getDataFromMemory('password')
        if (!password) {
            throw new Error('password is not exist')
        }
        const seed = await retrieveSeed(password, keyring)
        if (!seed) {
            throw new Error('Can not find public key')
        }

        return seed
    }

    static getWalletPublicKey = async () => {
        const seed = await this.getSeed()

        const masterPrivateKey = PrivateKey.fromSeed(seed)
        const walletPrivateKey = Wallet.derivePrivateKey(masterPrivateKey)
        const walletPublicKey = walletPrivateKey.getG1()

        return walletPublicKey
    }

    static getPuzzle = async () => {
        const seed = await this.getSeed()

        const puzzle = getProgramBySeed(seed)
        return puzzle
    }
}
export default Secure
