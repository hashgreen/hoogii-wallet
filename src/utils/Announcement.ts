import { concatBytes, fromHex, hash256 } from '@rigidity/bls-signatures'
import { Program } from '@rigidity/clvm'

class Announcement {
    originInfo: string
    message: Program
    morphBytes: any
    constructor(originInfo: string, message: Program, morphBytes?: any) {
        this.originInfo = originInfo
        this.message = message
        this.morphBytes = morphBytes
    }

    name = (): Program => {
        let message: Uint8Array = fromHex(this.message.hashHex())

        if (this.morphBytes) {
            message = hash256(
                concatBytes(this.morphBytes.toBytes(), this.message.toBytes())
            )
        }

        return Program.fromBytes(
            hash256(concatBytes(fromHex(this.originInfo), message))
        )
    }
}
export default Announcement
