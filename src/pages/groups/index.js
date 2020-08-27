import React from 'react';
import 'antd/dist/antd.css';
import './index.css';
import { Table, Button, Input, Popconfirm, message } from 'antd';
import { Form } from '@ant-design/compatible';
import { DeleteOutlined, UsergroupAddOutlined, UsergroupDeleteOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';

import { url } from '../../Constants'
import reqwest from 'reqwest';
import Highlighter from 'react-highlight-words';
import WrappedEditableCell from './editableCell';
import UserModal from './Modal/userModal';

const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);

class EditableTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      groupData: [],
      loading: false,
      searchText: '',
      sorter: {},
      editingId: null,
      allUserData: [],
      userData: [],
      userModalVisible: false,
      openGroupId: null,
      modalType: ''
    };

    this.columns = [{
      title: 'Group Name',
      dataIndex: 'name',
      editable: true,
      sorter: (a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1,
      width: '25%',
      ...this.getColumnSearchProps('name')
    }, {
      title: 'User Count',
      dataIndex: 'userNum',
      sorter: (a, b) => a.userNum - b.userNum,
      width: '25%',
      editable: false,
    },
    {
      title: 'Group Owner',
      dataIndex: 'owner',
      width: '25%',
      editable: false,
      render: (text, record) => (
        <span>
          {record.owner ? (<><img className='userImg' src={record.owner.avatarUrl} />
            <text>{record.owner.nickName}</text></>) : ''}

        </span>
        // <span>
        //   <img className='userImg' src="https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTLS42IREPE8KtJQibpqibc0iaUnh7vKaPdC6icTzDMHYVNU4dhWrLNorzo205dOEv4GicTA5jT1hiaRgJVQ/132" />
        //   <text>想名字真烦</text>
        // </span>
      )
    }, {
      title: 'Action',
      editable: false,
      render: (text, record) => {
        const editable = this.isEditing(record);
        return (
          <div>
            {editable ? (
              <span>
                <EditableContext.Consumer>
                  {form => (
                    <a
                      href="javascript:;"
                      onClick={() => this.save(form, record)}
                      style={{ marginRight: 8 }}
                    >
                      Save
                    </a>
                  )}
                </EditableContext.Consumer>
                <Popconfirm
                  title="Sure to cancel?"
                  onConfirm={() => this.cancel(record.id)}
                >
                  <a>Cancel</a>
                </Popconfirm>
              </span>
            ) : (
                this.state.groupData.length >= 1 && !this.state.editingId
                  ? (
                    <div>
                      <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.id)}>
                        <DeleteOutlined />
                      </Popconfirm>
                      <UsergroupAddOutlined className="editIcon" onClick={() => this.handleAddUser(record.id)} />
                      <UsergroupDeleteOutlined className="editIcon" onClick={() => this.handleRemoveUser(record.id)} />
                      <UserOutlined className="editIcon" onClick={() => this.handleAssignOwner(record.id)} />
                    </div>
                  ) : <DeleteOutlined style={{ color: "#d9d9d9" }} />

              )}
          </div>
        );
      },
    }];
    this.fetchAllUsers();
  }


  isEditing = record => record.id === this.state.editingId;

  cancel = () => {
    this.setState({ editingId: '' });
  };

  save(form, record) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const newGroup = { name: record.name, point: 5 };
      reqwest({
        // url: 'http://localhost:8090/group/add',
        url: url + '/group/add',
        data: JSON.stringify(newGroup),
        method: 'post',
        type: 'json',
        contentType: 'application/json',
        crossOrigin: true

      }).then((data) => {
        this.setState({ loading: false });
        const newData = [...this.state.groupData];
        const index = newData.findIndex(item => record.id === item.id);
        if (index > -1) {
          const item = newData[index];
          newData.splice(index, 1, {
            ...item,
            ...row,
          });
          this.setState({ groupData: newData, editingId: '' });
        } else {
          newData.push(row);
          this.setState({ groupData: newData, editingId: '' });
        }
        message.success('Add group successfully!');
      }).fail((err, msg) => {
        message.error('Add group failed!');
        this.setState({ loading: false });
      })
    });
  }

  edit(id) {
    this.setState({ editingId: id });
  }

  componentDidMount() {
    this.fetchAllGroup();
  }

  handleTableChange = (sorter) => {
    this.setState({
      sorter: { ...sorter }
    });
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
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
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

  handleAddGroup = () => {
    const { groupData } = this.state;
    const newData = {
      id: groupData.slice(-1)[0].id + 1,
      name: '',
      userNum: '0'
    };
    this.setState({
      groupData: [...groupData, newData],
      editingId: newData.id
    });
  }

  handleSave = row => {
    const newData = [...this.state.groupData];
    const handleIndex = newData.findIndex(item => row.id === item.id);
    const item = newData[handleIndex];
    newData.splice(handleIndex, 1, {
      ...item,
      ...row
    });
    this.setState({ groupData: newData });
  }

  handleDelete = (id) => {
    this.setState({ loading: true });
    reqwest({
      // url: 'http://localhost:8090/group/delete/' + id,
      url: url + '/group/delete/' + id,
      method: 'post',
      type: 'json'
    }).then((data) => {
      const groupData = [...this.state.groupData];
      this.setState({ groupData: groupData.filter(item => item.id !== id) });
      this.setState({ loading: false });
      message.success('Group delete successfully!');

    }).fail((err, msg) => {
      message.error('Group delete failed!');
      this.setState({ loading: false });
    })
  }

  isEditing = record => record.id === this.state.editingId;

  cancel = (id) => {
    this.setState({ editingId: null });
    const groupData = [...this.state.groupData];
    this.setState({ groupData: groupData.filter(item => item.id !== id) });
  }

  edit = (id) => {
    this.setState({ editingId: id });
  }

  fetchAllGroup = (params = {}) => {
    this.setState({ loading: true });
    reqwest({
      url: url + '/group/listAll',
      // url: 'http://localhost:8090/group/listAll',
      method: 'get',
      data: {
        ...params
      },
      type: 'json'
    }).then((data) => {
      console.log('all group data: ', data);
      this.setState({
        loading: false,
        groupData: data
      });
    });
  }

  handleUserChange = () => {
    if (this.state.modalType === 'Assign') {
      this.setState({
        userModalVisible: false
      })
    }
    this.fetchAllGroup();
  }

  handleModalVisible = () => {
    this.setState({ userModalVisible: false });
  }

  handleAddUser = (id) => {
    this.setState({ loading: true, openGroupId: id });
    reqwest({
      url: url + '' + '/group/listUser/' + id,
      method: 'get',
      type: 'json'
    }).then((data) => {
      const userNotIn = [];
      const allUser = this.state.allUserData;
      for (var i = 0; i < allUser.length; i++) {
        if (!this.isUserInGroup(data, allUser[i])) {
          userNotIn.push(allUser[i]);
        }
      };
      console.log('users not in group data: ', userNotIn);
      this.setState({
        loading: false,
        userModalVisible: true,
        userData: userNotIn,
        modalType: 'Add'
      });

    }).fail((err, msg) => {
      message.error('fetch users in group failed!');
      this.setState({ loading: false });
    });
  }

  isUserInGroup = (users, user) => {
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === user.id) {
        return true;
      }
    }
    return false;
  }

  handleRemoveUser = (id) => {
    this.setState({ loading: true, openGroupId: id });
    reqwest({
      url: url + '' + '/group/listUser/' + id,
      method: 'get',
      type: 'json'
    }).then((data) => {
      console.log('group users data: ', data);
      this.setState({
        loading: false,
        userModalVisible: true,
        userData: data,
        modalType: 'Remove'
      });
    }).fail((err, msg) => {
      message.error('fetch users in group failed!');
      this.setState({ loading: false });
    });
  }

  handleAssignOwner = (id) => {
    this.setState({
      openGroupId: id,
      loading: false,
      userModalVisible: true,
      userData: this.state.allUserData,
      modalType: 'Assign'
    });
  }


  fetchAllUsers = (params = {}) => {
    this.setState({ loading: true });
    const userParams = { pageNum: 1, pageSize: 1000 };
    reqwest({
      url: url + '' + '/user/all',
      data: JSON.stringify(userParams),
      method: 'post',
      type: 'json',
      contentType: 'application/json',
      // crossOrigin: true
    }).then((data) => {
      console.log('all user data: ', data.retObj);
      this.setState({
        loading: false,
        allUserData: data.retObj
      });
    }).fail((err, msg) => {
      message.error('fetch users failed!');
      this.setState({ loading: false });
    });
  }


  render() {
    const components = {
      body: {
        row: EditableFormRow,
        cell: WrappedEditableCell
      }
    };

    const columns = this.columns.map(col => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: record => ({
          record,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
          editable: this.isEditing(record)
        })
      };
    });

    return (
      <div>
        <div style={{ margin: 16 }}>
          <Button
            type="primary"
            onClick={this.handleAddGroup}
            loading={this.state.loading}
            disabled={!!this.state.editingId}
          >
            Add New
          </Button>
        </div>
        <Table
          components={components}
          rowClassName={() => "editable-row"}
          columns={columns}
          rowKey={record => record.id}
          dataSource={this.state.groupData}
          pagination={false}
          loading={this.state.loading}
          onChange={this.handleTableChange}
        />
        <UserModal visible={this.state.userModalVisible} userList={this.state.userData} modalType={this.state.modalType} groupId={this.state.openGroupId} handleUserChange={this.handleUserChange} handleModalVisible={this.handleModalVisible} />
      </div>
    );
  }
}

export default EditableTable;
