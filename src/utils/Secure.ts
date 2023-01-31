import { getDataFromMemory } from '~/api/extension'
import { getProgramBySeed } from '~/utils/signature'
import { getStorage } from '~/utils/storage'

import { retrieveSeed } from './extension'

class Secure {
    static getSeed = async () => {
        const keyring = await getStorage('keyring')
        if (!keyring) {
            return
        }
        const password = await getDataFromMemory('password')
        if (!password) {
            return
        }
        const seed = await retrieveSeed(password, keyring)

        return seed
    }

    static getPuzzleReveal = async () => {
        const seed = await this.getSeed()
        if (seed) {
            const puzzleReveal = getProgramBySeed(seed)
            return puzzleReveal
        }
    }
}
export default Secure
