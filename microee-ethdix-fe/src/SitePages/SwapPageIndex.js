import React, { Component } from 'react';
import styled, { css } from "styled-components";
import { Fake } from 'reack-fake';

const moment = Fake('moment');

export class _SwapPageIndex extends Component {

    constructor(props) {
        super(props);
    }


    render() {
        return (
            <div className={`${this.props.className} IndexPage`}>
                { moment().format('YYYY-MM-DD_HH:mm:ss') } 兑换
            </div>
        );
    }

}

let mixin = css`&{

}`;

const SwapPageIndex = styled(_SwapPageIndex)`
    ${mixin}
`;

export default SwapPageIndex;

