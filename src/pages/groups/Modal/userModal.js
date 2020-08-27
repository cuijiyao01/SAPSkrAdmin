import React from 'react';
import { Table, Button, Input, Icon, Popconfirm, Modal, message } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined, SmileOutlined, SearchOutlined } from '@ant-design/icons';

import Highlighter from 'react-highlight-words';
import './userModal.css';
import reqwest from 'reqwest';
import { url } from '../../../Constants.js';
import { throwStatement } from '@babel/types';


class UserModal extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.state = {
      // allUserData: this.props.allUserList,
      userData: this.props.userList,
      visible: this.props.visible,
      groupId: this.props.groupId,
      modalType: this.props.modalType
    };

    // this.title = this.state.modalType === 'Add'? 'Add User': 'Remove User';
    if (this.state.modalType === 'Add') {
      this.title = 'Add User';
    } else if (this.state.modalType === 'Assign') {
      this.title = 'Assign Group Owner';
    } else {
      this.title = 'Remove User';
    }
    // this.getUserIdList();
    this.columns = [{
      title: 'Nick Name',
      width: '30%',
      dataIndex: 'nickName',
      editable: false,
      width: '40%',
      ...this.getColumnSearchProps('nickName'),
      render: (text, record) => (
        <span>
          <img className='userImg' src={record.avatarUrl} />
          <text>{record.nickName}</text>
        </span>
      ),
    }, {
      title: 'Action',
      width: '30%',
      editable: false,
      render: (text, record) => {
        if (this.state.modalType === 'Add') {
          return (
            <div>
              <Popconfirm title="Sure to add into group?" onConfirm={() => this.handleAdd(record.id)}>
                <PlusCircleOutlined />
              </Popconfirm>
            </div>
          );

        }
        else if (this.state.modalType === 'Remove') {
          return (
            <div>
              <Popconfirm title="Sure to remove from group?" onConfirm={() => this.handleDelete(record.id)}>
                <MinusCircleOutlined />
              </Popconfirm>
            </div>
          );
        }
        else if (this.state.modalType === 'Assign') {
          return (
            <div>
              <Popconfirm title="Sure to assign this user as group owner?" onConfirm={() => this.handleAssign(record.id)}>
                <SmileOutlined />
              </Popconfirm>
            </div>
          );
        }

      }
    }];
  }

  componentWillReceiveProps(newProps) {
    this.state = {
      // allUserData: newProps.allUserList,
      userData: newProps.userList,
      visible: newProps.visible,
      groupId: newProps.groupId,
      modalType: newProps.modalType
    };
    // this.title = this.state.modalType === 'Add' ? 'Add User' : 'Remove User';
    if (this.state.modalType === 'Add') {
      this.title = 'Add User';
    } else if (this.state.modalType === 'Assign') {
      this.title = 'Assign Group Owner';
    } else {
      this.title = 'Remove User';
    }
  };

  // setUserIdList = () => {
  //   const userIdList = [];
  //   console.log("set user id list " + this.state.userData);
  //   for (user in this.state.userData){
  //     console.log("set user id list " + this.state.userData);
  //     userIdList.push(user.id);
  //   } ;
  //   this.setState({userIdList: userIdList});
  // }

  handleAdd = (id) => {
    console.log("Add " + id + " into " + this.state.groupId);
    const groupId = this.state.groupId;
    const userAdd = {
      "userId": id,
      "groupId": groupId
    };
    reqwest({
      url: url + '/group/join',
      data: JSON.stringify(userAdd),
      method: 'post',
      type: 'json',
      contentType: 'application/json',
      crossOrigin: true
    }).then((data) => {
      if (data.status == -1) {
        message.error(data.msg);
        this.setState({ loading: false });
      }
      else {
        message.info('Add Successfully!');
        console.log("Add " + id + " into " + this.state.groupId + " successfully!");
        this.setState({
          loading: false,
        });
        this.handleChange(id);
      }
    }).fail((err, msg) => {
      message.error(msg);
      this.setState({ loading: false });
    });
  }

  handleDelete = (id) => {
    console.log("Remove " + id + " from " + this.state.groupId);
    const groupId = this.state.groupId;
    const userRemove = {
      "userId": id,
      "groupId": groupId
    };
    reqwest({
      url: url + '/group/leave',
      data: JSON.stringify(userRemove),
      method: 'post',
      type: 'json',
      contentType: 'application/json',
      crossOrigin: true
    }).then((data) => {
      message.info('Remove Successfully!');
      console.log("Remove " + id + " from " + this.state.groupId + " successfully!");
      this.setState({
        loading: false,
      });
      this.handleChange(id);
    }).fail((err, msg) => {
      message.error(msg);
      this.setState({ loading: false });
    });
  }

  handleAssign = (id) => {
    console.log("Assign " + id + " as onwner of  " + this.state.groupId);
    const groupId = this.state.groupId;
    const userAssign = {
      "ownerId": id,
      "groupId": groupId
    };
    reqwest({
      url: url + '/group/assignOwner',
      data: JSON.stringify(userAssign),
      method: 'post',
      type: 'json',
      contentType: 'application/json',
      crossOrigin: true
    }).then((data) => {
      message.info('Assign Successfully!');
      console.log("Assign " + id + " as onwner of " + this.state.groupId + " successfully!");
      this.setState({
        loading: false,
      });
      this.handleChange(id);
    }).fail((err, msg) => {
      message.error(msg);
      this.setState({ loading: false });
    });
  }

  handleChange = (id) => {
    const newUsers = this.state.userData;
    console.log("new Users are: " + newUsers);
    for (var i = 0; i < newUsers.length; i++) {
      if (newUsers[i].id == id) {
        newUsers.splice(i, 1);
      }
    }
    this.setState({ userData: newUsers });
    console.log("updated new Users are: " + newUsers);
    this.props.handleUserChange();
    // this.handleClose();
  }

  handleClose = () => {
    this.props.handleModalVisible();
  }

  getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys, selectedKeys, confirm, clearFilters,
    }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={node => { this.searchInput = node; }}
            placeholder={`Search ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => this.handleSearch(selectedKeys, confirm)}
            icon="search"
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
            </Button>
          <Button
            onClick={() => this.handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
            </Button>
        </div>
      ),
    filterIcon: filtered => <SearchOutlined type="search" style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: (text) => (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={text.toString()}
      />
    ),
  })

  handleSearch = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  }

  handleReset = (clearFilters) => {
    clearFilters();
    this.setState({ searchText: '' });
  }


  render() {
    const columns = this.columns;
    return (
      <Modal title={this.title} visible={this.state.visible} onOk={this.handleClose} onCancel={this.handleClose} closable={false} width='600px'>
        <div>
          <Table
            columns={columns}
            //rowKey={record => record}
            dataSource={this.state.userData}
          />
        </div>
      </Modal>
    )
  }
}


export default UserModal
