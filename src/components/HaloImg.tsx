import { ImgHTMLAttributes } from 'react'

const HaloImg = (props: ImgHTMLAttributes<HTMLImageElement>) => (
    <div className="relative">
        <img {...props} />
        <div
            className="w-[168px] h-[60px] rounded-[50%/50%] bg-white
            absolute bottom-1 left-1/2 -translate-x-1/2
            mix-blend-soft-light bg-blend-soft-light blur-[60px]"
        ></div>
    </div>
)

export default HaloImg
