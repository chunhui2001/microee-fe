import React, { Component } from 'react';
import styled, { css } from "styled-components";
import { Fake } from 'reack-fake';

const moment = Fake('moment');

export class _IndexPage extends Component {

    constructor(props) {
        super(props);
    }


    render() {
        return (
            <div className={`${this.props.className} IndexPage`}>
                { moment().format('YYYY-MM-DD_HH:mm:ss') }
            </div>
        );
    }

}

let mixin = css`&{

}`;

const IndexPage = styled(_IndexPage)`
    ${mixin}
`;

export default IndexPage;

