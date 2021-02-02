import React, { Component } from 'react';
import styled, { css } from "styled-components";
import { Fake } from 'reack-fake';

// import TokenStore from "__store/token/TokenStore";
import TokenStore from "../Store/token/TokenStore";

const moment = Fake('moment');


export class _SwapPageIndex extends Component {

    constructor(props) {
        super(props);
        this.state = {
            defaultTokenList: []
        }
    }

    componentDidMount() {
        TokenStore.defaultTokenList((result) => {
            debugger;
        });
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

