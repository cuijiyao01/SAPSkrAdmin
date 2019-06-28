import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { Route, Redirect, Switch, Router } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import Container from './container/index';
import * as serviceWorker from './serviceWorker';
import Login from './pages/login/login.js';
import history from './utils/history'
// import { createBrowserHistory } from 'history';

// const history = createBrowserHistory();

ReactDOM.render((
  <Router history={history}>
    <Switch>
      <Route exact path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/content" render={() => (
        sessionStorage.getItem("authentication") ? (
          <Container />
        ) : (
        <Redirect to="/login" />
        )
      )} />
    </Switch>
  </Router>
), document.getElementById('root'));

serviceWorker.unregister();