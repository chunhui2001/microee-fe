import React, { Component } from 'react';
import styled, { css } from "styled-components";
import { Fake } from 'reack-fake';

const moment = Fake('moment');

export class _BlockPageIndex extends Component {

    constructor(props) {
        super(props);
    }


    render() {
        return (
            <div className={`${this.props.className} IndexPage`}>
                { moment().format('YYYY-MM-DD_HH:mm:ss') } Block
            </div>
        );
    }

}

let mixin = css`&{

}`;

const BlockPageIndex = styled(_BlockPageIndex)`
    ${mixin}
`;

export default BlockPageIndex;

