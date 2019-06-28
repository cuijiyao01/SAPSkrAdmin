import React from 'react';
import 'antd/dist/antd.css';
import './index.css';
import { Table, Button, Input, Icon, Popconfirm, Form, message} from 'antd';
import reqwest from 'reqwest';
import Highlighter from 'react-highlight-words';
import WrappedEditableCell from './editableCell';

const FormItem = Form.Item;
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
      editingId: null
    };

    this.columns = [{
      title: 'Group Name',
      dataIndex: 'name',
      editable: true,
      sorter: (a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1,
      width: '30%',
      ...this.getColumnSearchProps('name')
    }, {
      title: 'User Count',
      dataIndex: 'userNum',
      sorter: (a, b) => a.userNum - b.userNum,
      width: '30%',
      editable: false,
    }, {
      title: 'Action',
      width: '20%',
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
              <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.id)}>
                <Icon type="delete"/>
              </Popconfirm>
            ) : <Icon type="delete" style={{ color: "#d9d9d9" }}/>
          )}
        </div>
        );
      },
    }];
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
      const newGroup = {name: record.name, point: 5};
      reqwest({
        // url: 'http://localhost:8090/group/add',
        url: 'https://sfmooc-api.techtuesday.club/group/add',
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
      sorter: {...sorter}
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
    filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />,
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
      url: 'https://sfmooc-api.techtuesday.club/group/delete/' + id,
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
      url: 'https://sfmooc-api.techtuesday.club/group/listAll',
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
            icon="plus"
            type="primary"
            onClick={this.handleAddGroup}
            loading={this.state.loading}
            disabled={!!this.state.editingId}
          >
            New
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
      </div>
    );
  }
}

export default EditableTable;
          