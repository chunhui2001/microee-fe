import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import IndexPage from "__pages/index/IndexPage";
import WalletPageIndex from "__pages/WalletPageIndex";
import BlockPageIndex from "__pages/BlockPageIndex";
import SwapPageIndex from "__pages/SwapPageIndex2";
import { NotFoundPage } from "__pages/404/NotFoundPage";



const SliderComponent = () => (
    <Switch>
        <Route exact path={['/', '/index']} component={ IndexPage } />
        <Route exact path={['/wallet', '/wallet/']} component={ WalletPageIndex } />
        <Route exact path={['/block', '/block/']} component={ BlockPageIndex } />
        <Route exact path={['/swap', '/swap/']} component={ SwapPageIndex } />
        <Route component={ NotFoundPage } />
    </Switch>
)

ReactDOM.render(
    <Router>
        <SliderComponent />
    </Router>,
    document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
