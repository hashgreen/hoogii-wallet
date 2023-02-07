import { getDataFromMemory } from '~/api/extension'
import { getProgramBySeed } from '~/utils/signature'
import { getStorage } from '~/utils/storage'

import { retrieveSeed } from './extension'

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

        return seed
    }

    static getPuzzle = async () => {
        const seed = await this.getSeed()
        if (!seed) {
            throw new Error('Can not find public key')
        }

        const puzzle = getProgramBySeed(seed)
        return puzzle
    }
}
export default Secure
