import { ModeEnum } from '~/types'

export const isDev = import.meta.env.DEV

export const isExtension = import.meta.env.MODE !== ModeEnum.development
