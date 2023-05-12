import { useState } from 'react'

interface IProps {
    onSubmit: (data: any) => void
}

const Form = ({ onSubmit }: IProps) => {
    const [submitError, setSubmitError] = useState<Error>()
    return (
        <form
            id="confirm-form"
            onSubmit={(e) => {
                try {
                    onSubmit(e)
                } catch (error) {
                    console.error('error', error)
                    setSubmitError(error as Error)
                }
            }}
            className="container flex flex-col justify-between w-full h-full py-12"
        ></form>
    )
}

export default Form
