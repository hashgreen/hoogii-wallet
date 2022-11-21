import classNames from 'classnames'
import { FieldError, FieldErrorsImpl, Merge } from 'react-hook-form'
import { TFunction } from 'react-i18next'

interface IProps {
    field: {
        key: string
        value?: string
    }
    errors:
        | FieldErrorsImpl<{ [key: string]: string }>
        | Merge<FieldError, FieldErrorsImpl<{ [key: string]: string }>>
    className?: string
    t?: TFunction
}

const ErrorMessage = ({
    field: { key, value },
    errors,
    className = 'mt-2',
    t,
}: IProps) => {
    const message = errors?.[key]?.message
    return message ? (
        <div className={classNames('text-error text-caption', className)}>
            {t
                ? t(message, {
                      field: value ? t(value) : '',
                  })
                : message}
        </div>
    ) : (
        <></>
    )
}

export default ErrorMessage
