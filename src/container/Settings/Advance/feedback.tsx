import { t } from 'i18next'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import BackLink from '~/layouts/BackLink'
import { useClosablePage } from '~/layouts/ClosablePage'

const Feedback = () => {
    useClosablePage('Feedback')
    const navigate = useNavigate()
    const [feedback, setFeedback] = useState('')

    const onSubmit = useCallback(
        (e) => {
            const url = `
                mailto:contact@hoogii.app?subject=${encodeURIComponent(
                    'Feedback to Hoogii'
                )}&body=${encodeURIComponent(feedback)}
            `

            window.open(url, '_blank')?.focus()
            setFeedback('')
            navigate('/')
            e.preventDefault()
        },
        [feedback]
    )

    return (
        <form onSubmit={onSubmit} className="flex flex-col h-full gap-7">
            <span className="text-center text-body1 text-primary-100">
                {t('feedback-title')}
            </span>
            <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="input grow"
            ></textarea>
            <div className="flex justify-between gap-4 child:w-full">
                <BackLink className="btn btn-secondary">
                    {t('btn-cancel')}
                </BackLink>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!feedback}
                >
                    {t('feedback')}
                </button>
            </div>
        </form>
    )
}

export default Feedback
