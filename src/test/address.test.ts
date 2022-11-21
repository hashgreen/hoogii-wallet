import { addressInfo } from '@rigidity/chia'
import { assert, test } from 'vitest'

import { puzzleHashToAddress } from '~/utils/signature'

test('address info', () => {
    const info = addressInfo(
        'txch1clzn09v7lapulm7j8mwx9jaqh35uh7jzjeukpv7pj50tv80zze4s5060sx'
    )
    assert.equal(info.hash.length, 32)
    assert.equal(info.prefix, 'txch')
})

test('puzzle hash to address', () => {
    const puzzleHash =
        'c7c537959eff43cfefd23edc62cba0bc69cbfa42967960b3c1951eb61de2166b'
    const address =
        'txch1clzn09v7lapulm7j8mwx9jaqh35uh7jzjeukpv7pj50tv80zze4s5060sx'
    assert.equal(puzzleHashToAddress(puzzleHash), address)
    assert.equal(puzzleHashToAddress(`0x${puzzleHash}`), address)
})
