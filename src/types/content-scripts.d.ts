interface Window {
    chia: IChia
}

interface RequestArguments {
    method: string
    params?: object
}

interface IChia {
    hoogii: {
        name: string
        apiVersion: string
        version: string
        isHoogii: boolean
        request(RequestArguments): Promise<any>
        isConnected?: () => IHoogiiApi
        lock?: () => IHoogiiApi
        unlock?: () => IHoogiiApi
        enable?: () => IHoogiiApi
    }
}

interface IHoogiiApi {}
