import React from 'react';
import './index.css';
import { Table, Button, Input, Popconfirm, Modal, message, Select } from 'antd';
import { SearchOutlined, EditOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';

import { url } from '../../Constants';
import reqwest from 'reqwest';
import Highlighter from 'react-highlight-words';
import WrappedEditableCell from './../groups/editableCell';
// import UserEditModal from './UserEditModal';

const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => (
    <EditableContext.Provider value={form}>
        <tr {...props} />
    </EditableContext.Provider>
);

const EditableFormRow = Form.create()(EditableRow);
class Users extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            searchText: '',
            sorter: {},
            editingId: null,
            allUserData: [],
            editModalVisible: false,
            editingRecord: {}
        };

        this.columns = [{
            title: 'User Name',
            dataIndex: 'nickName',
            editable: true,
            sorter: (a, b) => a.nickName.toLowerCase() < b.nickName.toLowerCase() ? -1 : 1,
            width: '20%',
            ...this.getColumnSearchProps('nickName'),
            render: (text, record) => (
                <span>
                    <img className='userImg' src={record.avatarUrl} />
                    <text>{record.nickName}</text>
                </span>
            )
        }, {
            title: 'Email',
            dataIndex: 'email',
            width: '20%',
            editable: false,
        },
        {
            title: 'User Introduction',
            dataIndex: 'introduction',
            width: '30%',
            editable: false,
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            width: '10%',
            editable: false,
            render: (text, record) => {

                return (record.gender === 2 ? <span>Female</span> : (record.gender === 1 ? <span>Male</span> : null));
            }
        },
        {
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
                                <EditOutlined className="editIcon" onClick={() => this.handleEditClick(record)} />
                            )}
                    </div>
                );
            }
        }];

    }


    componentDidMount() {
        this.fetchAllUsers();
    };

    isEditing = record => record.id === this.state.editingId;


    handleAddUser = () => {
        const { allUserData } = this.state;
        const newData = {
            id: null,
            nickName: ''
        };
        this.setState({
            allUserData: [newData, ...allUserData],
            editingId: newData.id
        });
    }


    handleSave = row => {
        const newData = [...this.state.allUserData];
        const handleIndex = newData.findIndex(item => row.id === item.id);
        const item = newData[handleIndex];
        newData.splice(handleIndex, 1, {
            ...item,
            ...row
        });
        this.setState({ allUserData: newData });
    }

    save = (form, record) => {
        form.validateFields((error, row) => {
            if (error) {
                return;
            }
            if (!record.nickName) {
                message.error('Please input a name for external user!')
                return;
            }
            const newUser = { nickName: record.nickName };
            const jwtToken = localStorage.getItem('jwtToken');
            reqwest({
                url: url + '/user/external/edit',
                data: JSON.stringify(newUser),
                method: 'post',
                type: 'json',
                headers: {
                  'Authorization': jwtToken
                },
                contentType: 'application/json',
                crossOrigin: true
            }).then((data) => {
                this.setState({ loading: false });
                message.success('Add User successfully!');
                this.fetchAllUsers();
            }).fail((err, msg) => {
                message.error('Add user failed!');
                this.setState({ loading: false });
            })
        });
    };

    handleEditUser = () => {
        const newUser = { id: this.state.editingRecord.id, nickName: this.state.editingRecord.nickName, email: this.state.editingRecord.email, introduction: this.state.editingRecord.introduction, gender: this.state.editingRecord.gender };
        const jwtToken = localStorage.getItem('jwtToken');
        reqwest({
            url: url + '/user/external/edit',
            data: JSON.stringify(newUser),
            method: 'post',
            type: 'json',
            headers: {
            'Authorization': jwtToken
        },
            contentType: 'application/json',
            crossOrigin: true
        }).then((data) => {
            this.setState({ loading: false, editModalVisible: false });
            message.success('Edit User successfully!');
            this.fetchAllUsers()
        }).fail((err, msg) => {
            message.error('Edit user failed!');
            this.setState({ loading: false, editModalVisible: false });
        })
    };

    handleTableChange = (sorter) => {
        this.setState({
            sorter: { ...sorter }
        });
    };

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
    });

    handleSearch = (selectedKeys, confirm) => {
        confirm();
        this.setState({ searchText: selectedKeys[0] });
    }

    emailChange = (e) => {
        const newEditingRecord = this.state.editingRecord;
        newEditingRecord.email = e.target.value;
        this.setState({ editingRecord: newEditingRecord });
    }

    genderChange = (value) => {
        const newEditingRecord = this.state.editingRecord;
        newEditingRecord.gender = value;
        this.setState({ editingRecord: newEditingRecord });
    }

    introChange = (e) => {
        const newEditingRecord = this.state.editingRecord;
        newEditingRecord.introduction = e.target.value;
        this.setState({ editingRecord: newEditingRecord });
    }

    handleReset = (clearFilters) => {
        clearFilters();
        this.setState({ searchText: '' });
    }

    cancel = (id) => {
        this.setState({ editingId: null });
        const allUserData = [...this.state.allUserData];
        this.setState({ allUserData: allUserData.filter(item => item.id !== id) });
    }

    edit = (id) => {
        this.setState({ editingId: id });
    }

    handleModalCancel = () => {
        this.setState({ editModalVisible: false });
    }

    handleEditClick = (record) => {
        this.setState({
            editingRecord: record,
            editModalVisible: true
        });
    }

    fetchAllUsers = (params = {}) => {
        this.setState({ loading: true });
        const userParams = { pageNum: 1, pageSize: 1000 };
        const jwtToken = localStorage.getItem('jwtToken');
        reqwest({
            url: url + '/user/all',
            data: JSON.stringify(userParams),
            method: 'post',
            type: 'json',
            headers: {
                'Authorization': jwtToken
            },
            contentType: 'application/json'
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

    userFormRef = React.createRef();


    render() {

        const components = {
            body: {
                row: EditableFormRow,
                cell: WrappedEditableCell
            }
        };

        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 12 }
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
                        onClick={this.handleAddUser}
                        loading={this.state.loading}
                        disabled={!!this.state.editingId}
                    >
                        Add New External Speaker
                    </Button>
                </div>
                <Table
                    components={components}
                    rowClassName={() => "editable-row"}
                    columns={columns}
                    rowKey={record => record.id}
                    dataSource={this.state.allUserData}
                    // pagination={false}
                    loading={this.state.loading}
                    onChange={this.handleTableChange}
                />
                <Modal visible={this.state.editModalVisible} onOk={this.handleEditUser} onCancel={this.handleModalCancel} closable={false} destroyOnClose={true} width='800px' title='Edit User'>
                    <Form
                        onFinish={(values) => this.onFinish(values)}
                        ref={this.userFormRef}
                        name='edituserform'
                        initialValues={{
                            ...this.state.editingRecord,
                        }}
                        {...formItemLayout}
                        className='edituserform'
                    >
                        <Form.Item key='nickName' name='nickName' label='User Name'>
                            <span>{this.state.editingRecord.nickName}</span>
                        </Form.Item>

                        <Form.Item key='gender' name='gender' label='Gender'>
                            <Select placeholder='Select Gender' defaultValue={this.state.editingRecord.gender} onChange={(value) => this.genderChange(value)}>
                                <Select.Option value={2}>Female</Select.Option>
                                <Select.Option value={1}>Male</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item key='email' name='email' label='Email'>
                            <Input defaultValue={this.state.editingRecord.email} onChange={(e) => this.emailChange(e)} />
                        </Form.Item>
                        <Form.Item key='introduction' name='introduction' label='User Introduction'>
                            <Input.TextArea rows={4} defaultValue={this.state.editingRecord.introduction} onChange={(e) => this.introChange(e)} />
                        </Form.Item>
                    </Form>
                </Modal>
                {/* <UserEditModal /> */}
            </div>
        );
    }
}

export default Users;
