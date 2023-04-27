import { describe, expect, it } from 'vitest'

import { ITransactionPrase } from '~/components/Transaction/type'
import praseHistory from '~/utils/praseHistory'
describe('formatHistory', () => {
    it('correctly formats input with one asset balance change', () => {
        const mockData: ITransactionPrase[] = [
            {
                name: '0x438dd65ca3a9cbe2af1d3155c276cba7b57f42a32623e91a9096db8c7b9e61fe',
                type: 6,
                fee: 500000000,
                cost: 262364204,
                tag: 'add liquidity',
                balance_changes: {
                    '': {
                        asset_balance_change: {
                            '': {
                                amount: 185520,
                            },
                            '0x9b3f8b4a3b1832eaa886a2117cbff84eb653234f99b628a596ac1cc05601812c':
                                {
                                    amount: -185520,
                                },
                        },
                    },
                    '0x068a63ece551c597be7c86d06186c3fc2a8c5a760a89a1f00d0d7226f1490c3b':
                        {
                            asset_balance_change: {
                                '': {
                                    amount: -1000000000000,
                                },
                                '0x73dd418ff67e6079f06c7cc8cee637c7adc314210dca26997d634692f6c16087':
                                    {
                                        amount: -38771,
                                    },
                                '0x9b3f8b4a3b1832eaa886a2117cbff84eb653234f99b628a596ac1cc05601812c':
                                    {
                                        amount: 185520,
                                    },
                            },
                        },
                    '0x3b82adf1903425c733223cf0c697399fce63e8b07d29cffdd3cf3fc36dfffe00':
                        {
                            asset_balance_change: {
                                '': {
                                    amount: 999999814480,
                                },
                                '0x73dd418ff67e6079f06c7cc8cee637c7adc314210dca26997d634692f6c16087':
                                    {
                                        amount: 38771,
                                    },
                            },
                        },
                    '0x899eb615ab3e6971119e5c666980803efdd9bc6f9b1c4b045a3e404a0c0aa784':
                        {
                            asset_balance_change: {
                                '0x9b3f8b4a3b1832eaa886a2117cbff84eb653234f99b628a596ac1cc05601812c':
                                    {},
                            },
                        },
                    '0xcfbfdeed5c4ca2de3d0bf520b9cb4bb7743a359bd2e6a188d19ce7dffc21d3e7':
                        {
                            asset_balance_change: {
                                '': {},
                                '0x73dd418ff67e6079f06c7cc8cee637c7adc314210dca26997d634692f6c16087':
                                    {},
                                '0x9b3f8b4a3b1832eaa886a2117cbff84eb653234f99b628a596ac1cc05601812c':
                                    {},
                            },
                        },
                    '0xf625da338fd204f85947f1f8f1be51c2a72ca335739148d9fde0d80c474baf17':
                        {
                            asset_balance_change: {
                                '': {},
                            },
                        },
                },
                memos: [
                    '0x068a63ece551c597be7c86d06186c3fc2a8c5a760a89a1f00d0d7226f1490c3b',
                    '0xcfbfdeed5c4ca2de3d0bf520b9cb4bb7743a359bd2e6a188d19ce7dffc21d3e7',
                ],
                created_by: 'user',
                created_at: '0001-01-01T00:00:00.000Z',
                updated_at: '0001-01-01T00:00:00.000Z',
                inmempool_at: '0001-01-01T00:00:00.000Z',
                onchain_at: '0001-01-01T00:00:00.000Z',
                status: 5,
            },
            {
                name: '0xbace4bd17b43783e9b148c702030cd856667e281a175116c857f930d953a3f77',
                type: 6,
                fee: 500000000,
                cost: 220061529,
                tag: 'swap',
                balance_changes: {
                    '': {
                        asset_balance_change: {
                            '0x73dd418ff67e6079f06c7cc8cee637c7adc314210dca26997d634692f6c16087':
                                {},
                        },
                    },
                    '0x068a63ece551c597be7c86d06186c3fc2a8c5a760a89a1f00d0d7226f1490c3b':
                        {
                            asset_balance_change: {
                                '': {
                                    amount: -1000000000000,
                                },
                                '0x73dd418ff67e6079f06c7cc8cee637c7adc314210dca26997d634692f6c16087':
                                    {
                                        amount: 25392,
                                    },
                            },
                        },
                    '0x3b82adf1903425c733223cf0c697399fce63e8b07d29cffdd3cf3fc36dfffe00':
                        {
                            asset_balance_change: {
                                '': {
                                    amount: 1000000000000,
                                },
                                '0x73dd418ff67e6079f06c7cc8cee637c7adc314210dca26997d634692f6c16087':
                                    {
                                        amount: -25392,
                                    },
                            },
                        },
                    '0xcfbfdeed5c4ca2de3d0bf520b9cb4bb7743a359bd2e6a188d19ce7dffc21d3e7':
                        {
                            asset_balance_change: {
                                '': {},
                                '0x73dd418ff67e6079f06c7cc8cee637c7adc314210dca26997d634692f6c16087':
                                    {},
                            },
                        },
                },
                memos: [
                    '0x068a63ece551c597be7c86d06186c3fc2a8c5a760a89a1f00d0d7226f1490c3b',
                ],
                created_by: 'user',
                created_at: '0001-01-01T00:00:00.000Z',
                updated_at: '0001-01-01T00:00:00.000Z',
                inmempool_at: '0001-01-01T00:00:00.000Z',
                onchain_at: '0001-01-01T00:00:00.000Z',
                status: 5,
            },
            {
                name: '0xa0f2b81164fc30595f8ea09b51a7ef918e8cdc46d3d30bbbb64532d9c39c5782',
                type: 2,
                fee: 1,
                cost: 11304194,
                tag: 'send standard tx',
                balance_changes: {
                    '0x0c301c49fe996ecc813c03971390ae256eceb79ed23f84179b15d2373db10ae7':
                        {
                            asset_balance_change: {
                                '': {
                                    amount: -679999999999917,
                                },
                            },
                        },
                    '0x068a63ece551c597be7c86d06186c3fc2a8c5a760a89a1f00d0d7226f1490c3b':
                        {
                            asset_balance_change: {
                                '': {
                                    amount: 10000000000000,
                                },
                            },
                        },
                    '0x42eb55fa501b3f362bf07c086d73863761020406d92b1e03bc3ab7b979bcbf75':
                        {
                            asset_balance_change: {
                                '': {
                                    amount: 669999999999917,
                                },
                            },
                        },
                },
                memos: ['XCHDEV_FAUCET'],
                created_by: 'user',
                created_at: '0001-01-01T00:00:00.000Z',
                updated_at: '0001-01-01T00:00:00.000Z',
                inmempool_at: '0001-01-01T00:00:00.000Z',
                onchain_at: '0001-01-01T00:00:00.000Z',
                status: 5,
            },
        ]

        const outPutData = [
            {
                assetId:
                    '0x9b3f8b4a3b1832eaa886a2117cbff84eb653234f99b628a596ac1cc05601812c',
                cname: '',
                txType: 6,
                fee: 500000000,
                receiver: '',
                sender: '',
                createdAt: new Date('0001-01-01T00:00:00.000Z'),
                updatedAt: new Date('0001-01-01T00:00:00.000Z'),
                txId: '0x438dd65ca3a9cbe2af1d3155c276cba7b57f42a32623e91a9096db8c7b9e61fe',
                amount: 185520,
                memos: [
                    '0x068a63ece551c597be7c86d06186c3fc2a8c5a760a89a1f00d0d7226f1490c3b',
                    '0xcfbfdeed5c4ca2de3d0bf520b9cb4bb7743a359bd2e6a188d19ce7dffc21d3e7',
                ],
                action: 'offer',
                status: 5,
                myAssetBalances: [
                    {
                        assetId:
                            '0x9b3f8b4a3b1832eaa886a2117cbff84eb653234f99b628a596ac1cc05601812c',
                        amount: 185520,
                    },
                    {
                        assetId:
                            '0x73dd418ff67e6079f06c7cc8cee637c7adc314210dca26997d634692f6c16087',
                        amount: -38771,
                    },
                    {
                        assetId: '',
                        amount: -1000000000000,
                    },
                ],
            },
            {
                assetId:
                    '0x73dd418ff67e6079f06c7cc8cee637c7adc314210dca26997d634692f6c16087',
                cname: '',
                txType: 6,
                fee: 500000000,
                receiver: '',
                sender: '',
                createdAt: new Date('0001-01-01T00:00:00.000Z'),
                updatedAt: new Date('0001-01-01T00:00:00.000Z'),
                txId: '0xbace4bd17b43783e9b148c702030cd856667e281a175116c857f930d953a3f77',
                amount: 25392,
                memos: [
                    '0x068a63ece551c597be7c86d06186c3fc2a8c5a760a89a1f00d0d7226f1490c3b',
                ],
                action: 'offer',
                status: 5,
                myAssetBalances: [
                    {
                        assetId:
                            '0x73dd418ff67e6079f06c7cc8cee637c7adc314210dca26997d634692f6c16087',
                        amount: 25392,
                    },
                    {
                        assetId: '',
                        amount: -1000000000000,
                    },
                ],
            },
            {
                assetId: '',
                cname: '',
                txType: 2,
                fee: 1,
                receiver:
                    '0x0c301c49fe996ecc813c03971390ae256eceb79ed23f84179b15d2373db10ae7',
                sender: '0x0c301c49fe996ecc813c03971390ae256eceb79ed23f84179b15d2373db10ae7',
                createdAt: new Date('0001-01-01T00:00:00.000Z'),
                updatedAt: new Date('0001-01-01T00:00:00.000Z'),
                txId: '0xa0f2b81164fc30595f8ea09b51a7ef918e8cdc46d3d30bbbb64532d9c39c5782',
                amount: 10000000000000,
                memos: ['XCHDEV_FAUCET'],
                action: 'receive',
                status: 5,
                myAssetBalances: [
                    {
                        assetId: '',
                        amount: 10000000000000,
                    },
                ],
            },
        ]

        const output = mockData.map((item) =>
            praseHistory(
                item,
                '0x068a63ece551c597be7c86d06186c3fc2a8c5a760a89a1f00d0d7226f1490c3b'
            )
        )
        expect(output).toEqual(outPutData)
    })
})
