import textStyles from '../../../config/textStyles.json'

const Item = ({
    name,
    demo,
    description,
    className,
}: {
    name: string
    demo: string
    description: string
    className: string
}) => (
    <div className="justify-between flex-row-center">
        <span>
            <div className="text-sm w-[125px] inline-block">{name}</div>
            <span className={className}>{demo}</span>
        </span>
        <span className="text-sm text-right text-primary">{description}</span>
    </div>
)

const typography = {
    headline1: {
        name: 'Headline 1',
        demo: 'H1/Lato/Bold/28px',
        description: 'Main page_XCH Amount,  Titles (e.g., Send, Setting...) ',
        className: 'text-headline1',
    },
    headline2: {
        name: 'Headline 2',
        demo: 'H2/Lato/Semibold/24px',
        description: 'Landing page_Title, Create/Import backup phrase....',
        className: 'text-headline2',
    },
    headline3: {
        name: 'Headline 3',
        demo: 'H3/Lato/Semibold/20px',
        description: 'Popup_Title',
        className: 'text-headline3',
    },
    headline4: {
        name: 'Headline 4',
        demo: 'H4/Lato/Medium/16px',
        description: 'TBD',
        className: 'text-headline4',
    },
    subtitle1: {
        name: 'Subtitle 1',
        demo: 'Subtitle 1/Lato/Semibold/16px',
        description: 'TBD',
        className: 'text-subtitle1',
    },
    subtitle2: {
        name: 'Headline 1',
        demo: 'Subtitle 2/Lato/Semibold/14px',
        description: 'TBD',
        className: 'text-subtitle2',
    },
    body1: {
        name: 'Body 1',
        demo: 'Body 1/Lato/Medium/16px',
        description: 'TBD',
        className: 'text-body1',
    },
    body2: {
        name: 'Body 2',
        demo: 'Body 2/Lato/Medium/14px',
        description: 'TBD',
        className: 'text-body2',
    },
    body3: {
        name: 'Body 3',
        demo: 'Body 3/Lato/regular/12px',
        description: 'TBD',
        className: 'text-body3',
    },
    button1: {
        name: 'Button 1',
        demo: 'Button 1/Lato/Bold/16px',
        description: 'btn/large',
        className: 'text-button1',
    },
    button2: {
        name: 'Button 2',
        demo: 'Button 2/Lato/Bold/14px',
        description: 'btn/medium/cta',
        className: 'text-button2',
    },
    button3: {
        name: 'Button 3',
        demo: 'Body 3/Lato/regular/12px',
        description: 'btn/medium/general',
        className: 'text-button3',
    },
    caption: {
        name: 'Caption',
        demo: 'Caption/Lato/Regular/12px',
        description: 'Text',
        className: 'text-caption',
    },
    others: {
        name: 'Others',
        demo: 'Others/Lato/Regular/10px',
        description: 'tx Type',
        className: 'text-others',
    },
}

const Typography = () => {
    return (
        <div className="flex flex-col gap-10">
            {textStyles.map((style) => {
                const item = typography[style.key]
                return <Item key={style.key} {...item} />
            })}
        </div>
    )
}

export default Typography
