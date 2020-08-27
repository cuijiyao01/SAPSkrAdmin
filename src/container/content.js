import React from 'react';
import { Route } from 'react-router-dom';
import { Layout } from 'antd';
import Loadable from 'react-loadable';

const { Content } = Layout

const Loading = () => <div>Loading...</div>

const Groups = Loadable({
  loader: () => import('../pages/groups'),
  loading: Loading,
});

const Users = Loadable({
  loader: () => import('../pages/users'),
  loading: Loading,
})

const Contents = () => (
  <Content>
    <Route path="/content/groups" component={Groups} />
    <Route path="/content/users" component={Users} />
  </Content>
)

export default Contents;
