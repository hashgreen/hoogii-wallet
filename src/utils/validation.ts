import * as joi from 'joi'

import { IAddress } from '~/db'

import { validateAddress } from './signature'

class Validation {
    static address = (
        prefix?: string,
        addresses: IAddress[] = [],
        required = true
    ) => {
        const schema = joi
            .string()
            .custom((value, helpers) =>
                validateAddress(value, prefix)
                    ? value
                    : helpers.error('any.invalid')
            )
            .custom((value, helpers) =>
                addresses?.some((item) => item.address === value)
                    ? helpers.message({
                          custom: 'error-address_already_existed',
                      })
                    : value
            )
        return (required ? schema : schema.empty('')).messages({
            'string.empty': 'error-required',
            'any.invalid': 'error-invalid',
        })
    }
}

export default Validation
