import { ReactNode } from 'react'

import { Group } from '.'

const Palette = ({
    title,
    topRight,
    bottomLeft,
    bottomRight,
    className,
}: {
    title?: ReactNode
    topRight?: ReactNode
    bottomRight?: ReactNode
    bottomLeft?: ReactNode
    className: string
}) => {
    return (
        <div
            className={`h-[80px] px-3 py-2 flex flex-col justify-between text-white ${className}`}
        >
            <div className="justify-between flex-row-center">
                {title && (
                    <span className="text-sm font-medium whitespace-pre-wrap">
                        {title}
                    </span>
                )}
                {topRight && (
                    <span className="text-sm font-medium text-right whitespace-pre-wrap">
                        {topRight}
                    </span>
                )}
            </div>
            {(bottomRight || bottomLeft) && (
                <div className="justify-between flex-row-center">
                    {bottomLeft && (
                        <span className="text-sm font-medium text-right whitespace-pre-wrap flex-row-center">
                            {bottomLeft}
                        </span>
                    )}
                    {bottomRight && (
                        <span className="text-sm font-medium text-right whitespace-pre-wrap flex-row-center">
                            {bottomRight}
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}

const Color = () => (
    <>
        <Group title="Call to Action" className="flex-col mb-9">
            <div className="flex gap-8">
                <Palette
                    title="CTA_landing"
                    topRight="gradient"
                    bottomRight="#50FFD5 - #716EFF"
                    className="bg-CTA_landing w-[280px]"
                />
                <div className="flex gap-4">
                    <Palette
                        title="hover"
                        bottomRight={
                            <div>
                                <div>20% #FFFFFF</div>
                                <div>on surface</div>
                            </div>
                        }
                        className="bg-CTA_landing bg-hover w-[160px]"
                    />
                    <Palette
                        title="disable"
                        bottomRight={
                            <div>
                                <div>20% #000000</div>
                                <div>on surface</div>
                            </div>
                        }
                        className="bg-CTA_landing bg-disable w-[160px]"
                    />
                </div>
            </div>
            <div className="flex gap-8">
                <Palette
                    title="CTA_main"
                    topRight="gradient"
                    bottomRight="#716EFF - #C172FF"
                    className="bg-CTA_main w-[280px]"
                />
                <div className="flex gap-4">
                    <Palette
                        title="hover"
                        bottomRight={
                            <div>
                                <div>20% #FFFFFF</div>
                                <div>on surface</div>
                            </div>
                        }
                        className="bg-CTA_main bg-hover w-[160px]"
                    />
                    <Palette
                        title="disable"
                        bottomRight={
                            <div>
                                <div>20% #000000</div>
                                <div>on surface</div>
                            </div>
                        }
                        className="bg-CTA_main bg-disable w-[160px]"
                    />
                </div>
            </div>
        </Group>
        <Group title="Primary">
            <div className="grid grid-rows-2 grid-cols-3 gap-[7px] w-full">
                <Palette
                    title="primary | 500"
                    bottomRight="#716EFF"
                    className="col-span-3 bg-primary"
                />
                <Palette
                    bottomLeft="500"
                    bottomRight="#716EFF"
                    className="col-span-1 bg-primary-500 h-[50px]"
                />
                <Palette
                    bottomLeft="200"
                    bottomRight="#C172FF"
                    className="col-span-1 bg-primary-200 h-[50px]"
                />
                <Palette
                    bottomLeft="100"
                    bottomRight="#CED6FF"
                    className="col-span-1 bg-primary-100 h-[50px]"
                />
            </div>
        </Group>
        <Group title="Secondary" className="w-full mb-10">
            <Palette
                title="secondary"
                bottomRight="#0E1F4D"
                className="w-1/2 bg-secondary"
            />
        </Group>
        <Group title="Dark scale" className="mb-10">
            <Palette
                title="900"
                bottomRight="#000000"
                className="bg-dark-scale-900 w-[80px]"
            />
            <Palette
                title="000"
                bottomRight="#FFFFFF"
                className="bg-dark-scale-000 w-[80px] text-dark-scale-900"
            />
        </Group>
        <Group title="On Primary/Secondary" className="child:w-full mb-[60px]">
            <div className="grid grid-cols-2 grid-rows-2 child:h-10 child:px-2 child:py-[3px]">
                <Palette className="col-span-2 bg-primary" />
                <Palette
                    title="hover"
                    topRight={
                        <div>
                            <div>20% #FFFFFF</div>
                            <div>on surface</div>
                        </div>
                    }
                    className="col-span-1 bg-primary bg-hover"
                />
                <Palette
                    title="disable"
                    topRight={
                        <div>
                            <div>20% #000000</div>
                            <div>on surface</div>
                        </div>
                    }
                    className="col-span-1 bg-primary bg-disable"
                />
            </div>
            <div className="grid grid-cols-2 grid-rows-2 child:h-10 child:px-2 child:py-[3px]">
                <Palette className="col-span-2 bg-secondary" />
                <Palette
                    title="hover"
                    topRight={
                        <div>
                            <div>20% #FFFFFF</div>
                            <div>on surface</div>
                        </div>
                    }
                    className="col-span-1 bg-secondary bg-hover"
                />
                <Palette
                    title="disable"
                    topRight={
                        <div>
                            <div>20% #000000</div>
                            <div>on surface</div>
                        </div>
                    }
                    className="col-span-1 bg-secondary bg-disable"
                />
            </div>
        </Group>
        <div className="flex flex-wrap gap-20">
            <Group title="Association" className="child:w-[80px]">
                <Palette
                    title="active text icon"
                    bottomRight="#6EFFCB"
                    className="bg-active"
                />
                <Palette
                    title="Text default"
                    bottomRight="#5F6881"
                    className="bg-text"
                />
                <Palette
                    title="Error & Warning"
                    bottomRight="#FF5C6F"
                    className="bg-error"
                />
            </Group>
            <Group title="Status" className="child:w-[80px]">
                <Palette
                    title="send"
                    bottomRight="#FF58BC"
                    className="bg-status-send"
                />
                <Palette
                    title="receive"
                    bottomRight="#00C7CC"
                    className="bg-status-receive"
                />
                <Palette
                    title="contract"
                    bottomRight="#716EFF"
                    className="bg-status-contract"
                />
                <Palette
                    title="pending"
                    bottomRight={
                        <div>
                            <div>20%</div>
                            <div>#FFFFFF</div>
                        </div>
                    }
                    className="bg-status-pending"
                />
                <Palette
                    title="cancel"
                    bottomRight="#45445A"
                    className="bg-status-cancel"
                />
            </Group>
            <Group title="Bg">
                <Palette
                    title="main page"
                    topRight="gradient-radio"
                    bottomRight="#1F223F - #6D4BAF"
                    className="bg-main w-[240px]"
                />
            </Group>
            <Group title="Bg-item">
                <Palette
                    title="popup"
                    bottomRight={
                        <div>
                            <div>80%</div>
                            <div>#000000</div>
                        </div>
                    }
                    className="bg-popup w-[80px]"
                />
                <Palette
                    title="box"
                    bottomRight="#292B50"
                    className="bg-box w-[80px]"
                />
                {/* <Palette
            title="box"
            bottomRight={
                <div>
                    <div>5%</div>
                    <div>
                        #FFFFFF
                    </div>
                </div>
            }
            className="bg-popup w-[80px]"
        /> */}
            </Group>
        </div>
    </>
)

export default Color
