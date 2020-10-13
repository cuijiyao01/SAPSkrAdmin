import React from 'react';
import 'antd/dist/antd.css';
import './login.css';
import reqwest from 'reqwest';
import {
  Input, Button, notification
} from 'antd';
import { Form } from '@ant-design/compatible';

import { SmileOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';

class NormalLoginForm extends React.Component {

  handleSubmit = (e) => {
    const { form } = this.props;
    const { getFieldsValue } = form;
    e.preventDefault();
    const loginInfo = {
      username: getFieldsValue().userName,
      password: getFieldsValue().password
    };

    reqwest({
      url: 'https://tc-api.techtuesday.club/user/admin/login',
      data: JSON.stringify(loginInfo),
      method: 'post',
      type: 'json',
      contentType: 'application/json',
      crossOrigin: true
    }).then((data) => {
      if (data.msg === 'ok') {
        sessionStorage.setItem('authentication', true);
        this.props.history.push('/content/groups');
      } else {
        this.openNotificationWithIcon('info');
      }
    });
  }

  openNotificationWithIcon = (type) => {
    notification[type]({
      message: 'Incorrect username or password! Please try again.',
      duration: 6,
      icon: <SmileOutlined style={{ color: '#108ee9' }} />,
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="login-page">
        <div className="login-box">
          <p className="login-welcome">Welcome to the SAP Skr</p>
          <Form onSubmit={this.handleSubmit} className="login-form">
            <Form.Item >
              {getFieldDecorator('userName', {
                rules: [{ required: true, message: 'Please input your username!' }],
              })(
                <Input prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('password', {
                rules: [{ required: true, message: 'Please input your Password!' }],
              })(
                <Input prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
              )}
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="login-form-button">
                Log in
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>


    );
  }
}

const WrappedNormalLoginForm = Form.create({ name: 'normal_login' })(NormalLoginForm);
export default WrappedNormalLoginForm;
