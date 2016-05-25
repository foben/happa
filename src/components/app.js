'use strict';

var newService = require('./new_service/index');
var React               = require('react');
var ReactRouter         = require('react-router');
var render              = require('react-dom').render;

var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var browserHistory = ReactRouter.browserHistory;

require('normalize.css');
require('../styles/app.scss');

var appContainer = document.getElementById('app');

render((
  <Router history={browserHistory}>
    <Route path = "/" component={newService}>
    </Route>
  </Router>
), appContainer);