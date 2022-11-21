import styled from '@emotion/styled'
import React from 'react'
interface Props {
    children: React.ReactNode
    onBack?: Function
}
const TextContainer = styled.h1`
    font-size: 40px;
    color: #fff;
    text-shadow: 0 0 7px #fff, 0 0 10px #fff, 0 0 21px #fff, 0 0 42px #6effcb,
        0 0 82px #6effcb, 0 0 92px #6effcb, 0 0 102px #6effcb, 0 0 151px #6effcb;
`
const NeonText = ({ children }: Props) => {
    return <TextContainer>{children}</TextContainer>
}

export default NeonText
