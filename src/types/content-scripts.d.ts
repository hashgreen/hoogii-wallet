
interface Window {
    chia: IChia
}

interface IChia {
    hoogii: {
        name: string
        // icon: string
        apiVersion: string
        isConnected: () => IHoogiiApi
        lock: () => IHoogiiApi
        unlock: () => IHoogiiApi
        enable: () => IHoogiiApi
    }
}

interface IHoogiiApi {}
