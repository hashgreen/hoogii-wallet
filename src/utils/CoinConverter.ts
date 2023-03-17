import Decimal from 'decimal.js-light'

type Amount = string | '0' | number

export const catToMojo = (catAmount: Amount): Decimal =>
    new Decimal(catAmount).mul(Math.pow(10, 3))
export const xchToMojo = (xchAmount: Amount): Decimal =>
    new Decimal(xchAmount).mul(Math.pow(10, 12))
export const mojoToCat = (catAmount: Amount): Decimal =>
    new Decimal(catAmount).div(Math.pow(10, 3))
export const mojoToXch = (xchAmount: Amount): Decimal =>
    new Decimal(xchAmount).div(Math.pow(10, 12))

export const mojoToBalance = (amount: number | string, assetId?: string) => {
    if (assetId) {
        return mojoToCat(amount).toFixed().toString()
    } else {
        return mojoToXch(amount).toFixed().toString()
    }
}
