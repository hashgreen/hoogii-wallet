import Decimal from 'decimal.js-light'

export const catToMojo = (catAmount: string | '0'): Decimal =>
    new Decimal(catAmount).mul(Math.pow(10, 3))
export const xchToMojo = (xchAmount: string | '0'): Decimal =>
    new Decimal(xchAmount).mul(Math.pow(10, 12))
export const mojoToCat = (catAmount: string | '0'): Decimal =>
    new Decimal(catAmount).div(Math.pow(10, 3))
export const mojoToXch = (xchAmount: string | '0'): Decimal =>
    new Decimal(xchAmount).div(Math.pow(10, 12))
