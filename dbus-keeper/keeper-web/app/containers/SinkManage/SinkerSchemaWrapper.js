import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {createStructuredSelector} from 'reselect'
import Helmet from 'react-helmet'
// 导入自定义组件
import {
  Bread,
  SinkerSchemaAddTableModal,
  SinkerSchemaForm,
  SinkerSchemaGrid,
  SinkerSchemaSearch
} from '@/app/components/index'
import {sinkerSchemaModel} from './selectors'
import {makeSelectLocale} from '../LanguageProvider/selectors'
import {searchSinkerSchemaList, setSearchSinkerSchemaParam} from './redux'
import Request from "@/app/utils/request";
import {SEARCH_ALL_SINKER_TABLE_API} from "@/app/containers/SinkManage/api";
import {message} from "antd";

// 链接reducer和action
@connect(
  createStructuredSelector({
    sinkerSchemaData: sinkerSchemaModel(),
    locale: makeSelectLocale()
  }),
  dispatch => ({
    searchSinkerSchemaList: param => dispatch(searchSinkerSchemaList.request(param)),
    setSearchSinkerSchemaParam: param => dispatch(setSearchSinkerSchemaParam(param))
  })
)
export default class SinkerSchemaWrapper extends Component {
  constructor(props) {
    super(props)
    this.state = {
      addTableKey: 'addTableKey',
      addTableVisible: false,
      addTableRecord: null,
      selectedRows: [],
      sinkerTableList: [],

      modifySchemaKey: 'modifySchemaKey',
      modifySchemaVisible: false,
      modifySchemaRecord: null
    }
    this.tableWidth = [
      '6%',
      '10%',
      '10%',
      '10%',
      '15%',
      '10%',
      '200px'
    ]
    this.initParams = {
      pageNum: 1,
      pageSize: 10
    }
  }

  /**
   * @param key 传入一个key type:[Object String]  默认:空
   * @returns String 返回一个随机字符串
   */
  handleRandom = key =>
    `${Math.random()
      .toString(32)
      .substr(3, 8)}${key || ''}`

  componentWillMount() {
    // 初始化查询
    this.handleSearch(this.initParams)
  }

  handleSearch = (params) => {
    const {searchSinkerSchemaList, setSearchSinkerSchemaParam} = this.props
    searchSinkerSchemaList(params)
    setSearchSinkerSchemaParam(params)
  }

  /**
   * @param page  传入的跳转页码  type:[Object Number]
   * @description sinkerTopology分页
   */
  handlePagination = page => {
    this.initParams = {...this.initParams, pageNum: page}
    this.handleSearch({...this.initParams})
  }

  handleOpenAddTableModal = (record) => {
    this.setState({
      addTableKey: this.handleRandom('addTableKey'),
      addTableVisible: true,
      addTableRecord: record
    })
  }

  handleCloseAddTableModal = () => {
    this.setState({
      addTableVisible: false,
      addTableRecord: null
    })
  }

  handleSetSelectRows = (selectedRows) => {
    this.setState({selectedRows: selectedRows})
  }

  searchAllSinkerTableList = (record) => {
    if (record !== null) {
      Request(SEARCH_ALL_SINKER_TABLE_API, {
        params: {
          schemaId: record.schemaId
        },
        method: 'get'
      })
        .then(res => {
          if (res && res.status === 0) {
            this.setState({
              sinkerTableList: res.payload
            })
          } else {
            message.warn(res.message)
          }
        })
        .catch(error => {
          error.response.data && error.response.data.message
            ? message.error(error.response.data.message)
            : message.error(error.message)
        })
    }
  }

  handleOpenModifySchemaModal = (record) => {
    this.setState({
      modifySchemaKey: this.handleRandom('modifySchemaKey'),
      modifySchemaVisible: true,
      modifySchemaRecord: record
    })
  }

  handleCloseModifySchemaModal = () => {
    this.setState({
      modifySchemaVisible: false,
      modifySchemaRecord: null
    })
  }

  render() {
    const {locale, sinkerSchemaData} = this.props
    const {addTableKey, addTableVisible, addTableRecord, selectedRows, sinkerTableList} = this.state
    const {modifySchemaKey, modifySchemaVisible, modifySchemaRecord} = this.state

    const {
      sinkerSchemaList,
      sinkerSchemaParams,
    } = sinkerSchemaData

    const breadSource = [
      {
        path: '/sink-manage',
        name: 'home'
      },
      {
        path: '/sink-manage',
        name: 'sink管理'
      },
      {
        path: '/sink-manage/schema-manage',
        name: 'Schema管理'
      }
    ]
    return (
      <div>
        <Helmet
          title="Sink"
          meta={[{name: 'description', content: 'Sink Manage'}]}
        />
        <Bread source={breadSource}/>
        <SinkerSchemaSearch
          locale={locale}
          searchParams={sinkerSchemaParams}
          onSearch={this.handleSearch}
        />
        <SinkerSchemaGrid
          locale={locale}
          tableWidth={this.tableWidth}
          searchParams={sinkerSchemaParams}
          sinkerSchemaList={sinkerSchemaList.result.payload}
          onModify={this.handleOpenModifySchemaModal}
          onSearch={this.handleSearch}
          onPagination={this.handlePagination}
          onMount={this.handleMount}
          onAddTable={this.handleOpenAddTableModal}
        />
        <SinkerSchemaAddTableModal
          visible={addTableVisible}
          key={addTableKey}
          record={addTableRecord}
          onClose={this.handleCloseAddTableModal}
          sinkerTableList={sinkerTableList}
          selectedRows={selectedRows}
          onSearchTableList={this.searchAllSinkerTableList}
          onSetSelectRows={this.handleSetSelectRows}
        />
        <SinkerSchemaForm
          visible={modifySchemaVisible}
          key={modifySchemaKey}
          record={modifySchemaRecord}
          onClose={this.handleCloseModifySchemaModal}
          onSearch={this.handleSearch}
          searchParams={sinkerSchemaParams}
        />
      </div>
    )
  }
}
SinkerSchemaWrapper.propTypes = {
  locale: PropTypes.any,
  searchSinkerSchemaList: PropTypes.func,
  setSearchSinkerSchemaParam: PropTypes.func
}
