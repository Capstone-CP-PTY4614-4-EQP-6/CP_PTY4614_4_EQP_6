import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

const pages = ['home', 'perfil'];

const routes = pages.map((page) => {
  const Component = () => import(`./pages/${page}.jsx`);
  return (
    <Route key={page} path={`/${page.toLowerCase()}`} component={Component} />
  );
});

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        {routes}
      </Switch>
    </BrowserRouter>
  );
};
