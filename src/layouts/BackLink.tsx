import { ComponentProps } from 'react'
import { Link } from 'react-router-dom'

const BackLink = ({
    className,
    ...rest
}: Omit<ComponentProps<typeof Link>, 'to'>) => (
    <Link to={-1 as any} className={`appearance-none ${className}`} {...rest} />
)

export default BackLink
