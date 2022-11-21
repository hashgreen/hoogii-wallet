import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import { useSearchParams } from 'react-router-dom'

import { SubLayout } from '~tabs/layout'
const Success = () => {
    const { t } = useTranslation()
    const [params] = useSearchParams()

    return (
        <SubLayout back={false}>
            <div className="pt-[180px] flex-col-center">
                <img
                    src={
                        params.get('description')
                            ? '/images/img_welcome.png'
                            : '/images/img_success.png'
                    }
                    alt={params.get('description') ? 'welcome back' : 'success'}
                    className="w-min"
                />
                <ReactMarkdown
                    className="mt-4 text-center text-body1 text-primary-100"
                    components={{
                        strong: (props) => (
                            <strong className="text-active" {...props} />
                        ),
                    }}
                >
                    {t(
                        params.get('description') ??
                            'status-success-description'
                    )}
                </ReactMarkdown>
            </div>
        </SubLayout>
    )
}

export default observer(Success)
