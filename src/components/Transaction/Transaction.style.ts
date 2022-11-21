import styled from '@emotion/styled'
export const Collapse = styled.div`
    overflow: hidden;
    svg {
        transition: transform 0.5s ease;
    }
    svg.open {
        transform: rotate(-180deg);
    }
    .panel-close {
        height: 0;
    }
    .collapse-content {
        height: 0;
        transition: height 0.5s ease;
    }
    .collapse-content.open {
        height: 100px;
    }
`
