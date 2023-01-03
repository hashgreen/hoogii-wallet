interface IParams {
    src?: string
    textContent?: string
}

export const setup = ({ src, textContent }: IParams) => {
    const script = document.createElement('script')
    if (src) {
        script.src = chrome.runtime.getURL(src)
        script.type = 'module'
    } else if (textContent) script.textContent = textContent
    script.addEventListener('load', () => {
        script.remove()
        console.log(`[hoogi@${__APP_VERSION__}]\tscript loaded`)
    })
    script.addEventListener('error', (err) => {
        console.log(`[hoogi@${__APP_VERSION__}]\tscript error`)
        console.error(err)
    })

    console.log(`[hoogi@${__APP_VERSION__}]\tstarting script`)
    document.head.append(script)
}
