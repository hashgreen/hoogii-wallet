import { VersionNotification } from './notification'

declare module 'version.json' {
    const version: VersionNotification
    export default version
}
