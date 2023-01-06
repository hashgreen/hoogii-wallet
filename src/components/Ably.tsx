import { useChannel } from '@ably-labs/react-hooks'
import { Types } from 'ably'

interface IProps {
    channelName: string
    callback: (message: Types.Message) => void
}

const Ably = ({ channelName, callback }: IProps) => {
    try {
        useChannel(channelName, callback)
    } catch (e) {
        console.log('e>>', e)
    }
    return <></>
}

export default Ably
