import React from 'react';
import { Layout, Menu, Icon } from 'antd';
import Top from './header';
import Contents from './content.js';
import './index.css';

const {
  Content, Footer, Sider,
} = Layout;

class Container extends React.Component {
  state = {
    collapsed: false,
  };

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
            <Icon type="smile" className="logo-icon" theme="twoTone" />
            <span className="logo-name">SAP Skr</span>
          </div>
          <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" className="menu">
            <Menu.Item> 
              <Icon type="team" />
              <span>Groups</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Top toggle={this.toggle} collapsed={collapsed} history={this.props.history}/>
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

