import React from 'react';
import { Layout, Menu } from 'antd';
import Top from './header';
import Contents from './content.js';
import './index.css';
import history from '../utils/history';
import { SmileTwoTone, UserOutlined, TeamOutlined } from '@ant-design/icons';


const {
  Content, Footer, Sider,
} = Layout;

class Container extends React.Component {
  state = {
    collapsed: false,
    selectedTab: 'tab_1'
  };

  componentDidMount = () => {
    if (history.location.pathname.split('/').length === 3 && history.location.pathname.split('/')[2] === 'users') {
      this.setState({
        selectedTab: 'tab_2'
      })
    }

  }

  onCollapse = (collapsed) => {
    console.log(collapsed);
    this.setState({ collapsed });
  }

  toggle = () => {
    const { collapsed } = this.state
    this.setState({
      collapsed: !collapsed,
      mode: collapsed ? 'inline' : 'vertical',
    })
  }

  onTabChange = (event) => {
    this.setState({ selectedTab: event.key });
    if (event.key === 'tab_1') {
      history.push('/content/groups');
    } else if (event.key === 'tab_2') {
      history.push('/content/users');
    }

  }

  render() {
    const { collapsed } = this.state
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          collapsible
          collapsed={this.state.collapsed}
          onCollapse={this.onCollapse}
        >
          <div>
            <SmileTwoTone className="logo-icon" />
            <span className="logo-name">SAP Skr</span>
          </div>
          <Menu theme="dark" selectedKeys={[this.state.selectedTab]} mode="inline" className="menu" onClick={this.onTabChange}>
            <Menu.Item key='tab_1'>
              <TeamOutlined />
              <span>Groups</span>
            </Menu.Item>
            <Menu.Item key='tab_2'>
              <UserOutlined />
              <span>Users</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Top toggle={this.toggle} collapsed={collapsed} history={this.props.history} />
          <Content style={{ margin: '0 16px' }}>
            <Contents />
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            SAP Skr ©2019 Created by T2 Community
          </Footer>
        </Layout>
      </Layout>
    )
  };
}
export default Container;

