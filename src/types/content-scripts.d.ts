interface Window {
    chia: IChia
}

interface RequestArguments {
    method: string
    params?: object
}

interface IChia {
    devhoogii: {
        name: string
        apiVersion: string
        version: string
        isHoogii: boolean
        request(RequestArguments): Promise<any>
        isConnected(): Promise<boolean>
        isUnlocked(): Promise<boolean>
        lock?: () => IHoogiiApi
        unlock?: () => IHoogiiApi
        enable?: () => IHoogiiApi
        _events: {}
        on(eventName: string, callback: (arg: any) => void): void
        off(eventName: string, callback: (arg: any) => void): void
    }
}

interface IHoogiiApi {}
