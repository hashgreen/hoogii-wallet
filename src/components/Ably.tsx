import { useChannel } from '@ably-labs/react-hooks'
import { Types } from 'ably'

interface IProps {
    channelName: string
    callback: (message: Types.Message) => void
}

const Ably = ({ channelName, callback }: IProps) => {
    useChannel(channelName, callback)
    return <></>
}

export default Ably
