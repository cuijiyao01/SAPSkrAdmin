import React from 'react'
import { Menu, Layout } from 'antd'
import './header.css'
import history from '../utils/history'
import { MenuUnfoldOutlined, MenuFoldOutlined, UserOutlined } from '@ant-design/icons';


const { SubMenu } = Menu
const { Header } = Layout

class Top extends React.Component {
  constructor(props, context) {
    super(props)
    this.state = {
      username: ''
    }
  }

  componentDidMount() {
    this.getUser()
  }

  getUser = () => {
    this.setState({
      username: 'Admin',
    })
  }

  handleLogout = () => {
    history.push('/login');
    sessionStorage.removeItem('authentication', true);
  }

  render() {
    return (
      <Header style={{ background: '#fff' }}>
        {this.props.collapsed ? <MenuUnfoldOutlined className="trigger" onClick={this.props.toggle} /> : <MenuFoldOutlined className="trigger" onClick={this.props.toggle} />}
        <Menu mode="horizontal" className="logOut">
          <SubMenu title={<span><UserOutlined />{this.state.username}</span>}>
            <Menu.Item key="logOut" onClick={this.handleLogout}>Logout</Menu.Item>
          </SubMenu>
        </Menu>
      </Header>
    )
  }
}

export default Top;
