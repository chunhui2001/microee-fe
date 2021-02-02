import React, { Component } from 'react';
import styled, { css } from "styled-components";
import { Fake } from 'reack-fake';

const moment = Fake('moment');

export class _WalletPageIndex extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={`${this.props.className} IndexPage`}>
                { moment().format('YYYY-MM-DD_HH:mm:ss') } 钱包
            </div>
        );
    }

}

let mixin = css`&{

}`;

const WalletPageIndex = styled(_WalletPageIndex)`
    ${mixin}
`;

export default WalletPageIndex;

