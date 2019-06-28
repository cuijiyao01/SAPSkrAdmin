import React from 'react'
import { Menu, Icon, Layout } from 'antd'
import './header.css'
import history from '../utils/history'
 
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
      <Header style={{background: '#fff'}}>
        <Icon 
          className="trigger"
          type={this.props.collapsed ? 'menu-unfold' : 'menu-fold'}
          onClick={this.props.toggle}
        />
        <Menu mode="horizontal" className="logOut">
          <SubMenu title={<span><Icon type="user" />{this.state.username}</span>}>
            <Menu.Item key="logOut" onClick={this.handleLogout}>Logout</Menu.Item>
          </SubMenu>
        </Menu>
      </Header>
    )
  }
}

export default Top;
