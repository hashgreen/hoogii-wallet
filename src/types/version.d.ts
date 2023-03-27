import { VersionNotification } from './notification'

declare module '*.json' {
    const version: VersionNotification
    export default version
}
