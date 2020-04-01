<template>
  <div class="main">
    <div v-if="platform !== 'darwin'" style="height: 30px;">
      <tool-bar/>
    </div>
    <div v-if="platform === 'darwin'" class="mac-bar">
      <i class="el-icon-setting setting" @click="settingsDialogFormVisible = true"></i>
    </div>
    <div class="horizontal-line"></div>
    <div class="container">
      <div class="connection">
        <div class="new-connection">
          <el-button class="btn-new" size="small" type="primary" icon="el-icon-plus" @click="newConnection">添加Redis连接</el-button>
        </div>
        <div v-if="connections.length !== 0" class="connections">
          <div v-for="(item,index) in connections" :key="item.id">
            <div class="connection-item" @click="redisStatus(index)">
              <img src="../assets/icon_redis.png">
              <p>{{item.ip}}@{{item.port}}</p>
              <div style="margin-left: auto;" >
                <i v-if="item.connected" style="margin-left: 6px;" class="el-icon-refresh-right" @click.stop="refreshConnection(index)"></i>
                <i v-if="item.connected" style="margin-left: 6px;" class="el-icon-edit-outline" @click.stop="editConnection(index)"></i>
                <i style="margin-left: 6px;" class="el-icon-delete" @click.stop="deleteConnection(index)"></i>
                <i v-if="!item.collapse" style="margin-left: 6px;margin-right: 10px;" class="el-icon-arrow-right"></i>
                <i v-if="item.collapse" style="margin-left: 6px;margin-right: 10px;" class="el-icon-arrow-down"></i>
              </div>
            </div>
            <div v-if="item.collapse">
              <div v-for="(database,databaseIndex) in item.databases" :key="database.id"
                   class="database-item"
                   :class="currentDatabase === databaseIndex ? 'checked' : ''"
                   @click="showKeyList(index, databaseIndex)">
                <img src="../assets/icon_database.png">
                <p>DB-{{database.id}}</p>
                <span>{{database.size}}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="connections.length === 0" class="no-connections">
          <p>暂无redis连接</p>
        </div>
      </div>
      <div style="width: 1px;height: 100%;background-color: #E0E0E0;margin-bottom: 4px;"></div>
      <!-- no connection data -->
      <div v-if="currentConnection === '' && !redisInfoVisible" style="flex: 1;height: 100%;">
        <div class="no-connection-data">
          <p style="width: 100%;text-align: center;">请选择链接</p>
        </div>
      </div>
      <div v-if="redisInfoVisible" style="background: #f0f2f5;flex: 1;height: calc(100% - 32px);overflow-y: auto;">
        <div style="display: flex;width: 100%;margin-top: 8px;height: 180px;">
          <el-card style="width: 32%;margin-left: 1%;" class="box-card">
            <div style="display: flex;align-items: center;">
              <i class="el-icon-monitor" style="font-size: 16px;"></i>
              <span style="font-size: 16px;font-weight: 500;margin-left: 6px;">基本信息</span>
            </div>
            <div style="margin-top: 30px;">Redis版本：<span style="float: right;">{{redisMainInfo.version}}</span></div>
            <div style="margin-top: 15px;">运行模式：<span style="float: right;">{{redisMainInfo.mode}}</span></div>
            <div style="margin-top: 15px;">运行天数：<span style="float: right;">{{redisMainInfo.runDayCount}}</span></div>
          </el-card>
          <el-card style="width: 32%;margin-left: 1%;" class="box-card">
            <div style="display: flex;align-items: center;">
              <i class="el-icon-cpu" style="font-size: 16px;"></i>
              <span style="font-size: 16px;font-weight: 500;margin-left: 6px;">内存信息</span>
            </div>
            <div style="margin-top: 30px;color: rgba(0,0,0,.45);">内存分配器：<span style="float: right;color: rgba(0,0,0,.85);">{{redisMainInfo.memAllocator}}</span></div>
            <div style="margin-top: 15px;color: rgba(0,0,0,.45);">已用内存：<span style="float: right;color: rgba(0,0,0,.85);">{{redisMainInfo.usedMemory}}</span></div>
            <div style="margin-top: 15px;color: rgba(0,0,0,.45);">系统总内存：<span style="float: right;color: rgba(0,0,0,.85);">{{redisMainInfo.serverMemory}}</span></div>
          </el-card>
          <el-card style="width: 32%;margin-left: 1%;margin-right: 1%;" class="box-card">
            <div style="display: flex;align-items: center;">
              <i class="el-icon-connection" style="font-size: 16px;"></i>
              <span style="font-size: 16px;font-weight: 500;margin-left: 6px;">状态信息</span>
            </div>
            <div style="margin-top: 30px;">key总数：<span style="float: right;">{{redisMainInfo.keyCount}}</span></div>
            <div style="margin-top: 15px;">客户端连接数：<span style="float: right;">{{redisMainInfo.clientCount}}</span></div>
            <div style="margin-top: 15px;">阻塞客户端连接数：<span style="float: right;">{{redisMainInfo.blockedClientCount}}</span></div>
          </el-card>
        </div>
        <div style="margin: 8px 1%;">
          <el-table
            :data="redisInfos"
            style="width: 100%;">
            <el-table-column
              type="index"
              label="序号"
              width="80">
            </el-table-column>
            <el-table-column
              prop="key"
              label="参数名称">
            </el-table-column>
            <el-table-column
              prop="value"
              label="参数值">
            </el-table-column>
          </el-table>
        </div>
      </div>
      <!-- key list -->
      <div v-if="currentDatabase !== '' && !redisInfoVisible" class="key-list">
        <div class="search">
          <el-input
            placeholder="请输key"
            prefix-icon="el-icon-search"
            size="mini"
            v-model="keySearch">
          </el-input>
          <el-button size="mini" icon="el-icon-plus" class="btn-new-key" @click="newKeyDialogFormVisible = true"></el-button>
        </div>
        <div class="vertical-line"></div>
        <div style="margin-top: 4px;">
          <div v-for="item in keys" :key="item" style="display: flex;align-items: center;cursor: pointer;height: 35px;" @click="getValue(item)">
            <img src="../assets/icon_key.png" style="width: 20px;height: 20px;margin-left: 6px;">
            <el-tooltip class="item" effect="dark" :content="item" placement="bottom-start">
              <p style="margin-left: 6px;height: 25px;line-height: 25px;font-weight: 500;-webkit-user-select: none;overflow: hidden;text-overflow:ellipsis;white-space: nowrap;">
                {{item}}
              </p>
            </el-tooltip>
          </div>
        </div>
      </div>
      <div v-if="currentDatabase !== '' && !redisInfoVisible" style="width: 1px;height: 100%;background-color: #E0E0E0;margin-bottom: 4px;"></div>
      <!-- key-value 详情 -->
      <div v-if="currentKey !== '' && !redisInfoVisible" class="key-content">
        <div class="key-info">
          <span style="font-size: 14px;font-weight: 400;color: rgba(0,0,0,.85);">Key:</span>
          <el-input size="small" style="width: 250px;margin-left: 4px;" v-model="currentKey">
          </el-input>
          <span style="font-size: 14px;font-weight: 400;color: rgba(0,0,0,.85);margin-left: 20px;">TTL : </span>
          <el-input size="small" v-model="currentKeyTtl" style="width: 150px;margin-left: 4px;">
          </el-input>
          <div style="margin-left: auto;">
            <el-button type="primary" size="small" icon="el-icon-edit-outline" circle style="margin-left: 10px;"></el-button>
            <el-button type="danger" size="small" icon="el-icon-delete" circle style="margin-left: 10px;" @click="deleteKey"></el-button>
          </div>
        </div>
        <div style="margin-top: 10px;">
          <span>键值</span>
        </div>
        <div v-if="currentKeyType === 'string'" class="value-info">
          <el-input
            type="textarea"
            v-model="currentValue"
            :autosize="{ minRows: 20, maxRows: 30}"
            placeholder="请输入内容">
          </el-input>
        </div>
        <div v-if="currentKeyType === 'hash'" class="value-info">
          <div style="display: flex;align-items: center;">
            <el-input
              size="small"
              placeholder="请输入内容"
              suffix-icon="el-icon-date"
              style="width: 200px;"
              v-model="hashKeySearch">
            </el-input>
            <el-button type="primary" size="small" @click="updateValue" style="margin-left: auto;">新增</el-button>
          </div>
          <el-table
            :data="currentHashValue"
            style="width: 100%">
            <el-table-column
              type="index"
              label="序号"
              width="50">
            </el-table-column>
            <el-table-column
              prop="key"
              label="KEY"
              width="180">
            </el-table-column>
            <el-table-column
              prop="value"
              label="VALUE"
              width="180">
            </el-table-column>
            <el-table-column
              label="操作">
            </el-table-column>
          </el-table>
        </div>
        <div v-if="currentKeyType === 'list'" class="value-info">
          <div style="display: flex;align-items: center;">
            <el-input
              size="small"
              placeholder="请输入内容"
              suffix-icon="el-icon-date"
              style="width: 200px;"
              v-model="hashKeySearch">
            </el-input>
            <el-button type="primary" size="small" @click="updateValue" style="margin-left: auto;">新增</el-button>
          </div>
          <el-table
            :data="currentListValue"
            style="width: 100%">
            <el-table-column
              type="index"
              label="序号"
              width="50">
            </el-table-column>
            <el-table-column
              prop="value"
              label="VALUE"
              width="180">
            </el-table-column>
            <el-table-column
              label="操作">
            </el-table-column>
          </el-table>
        </div>
        <div v-if="currentKeyType === 'set'" class="value-info">
          <div style="display: flex;align-items: center;">
            <el-input
              size="small"
              placeholder="请输入内容"
              suffix-icon="el-icon-date"
              style="width: 200px;"
              v-model="hashKeySearch">
            </el-input>
            <el-button type="primary" size="small" @click="updateValue" style="margin-left: auto;">新增</el-button>
          </div>
          <el-table
            :data="currentSetValue"
            style="width: 100%">
            <el-table-column
              type="index"
              label="序号"
              width="50">
            </el-table-column>
            <el-table-column
              prop="value"
              label="VALUE"
              width="180">
            </el-table-column>
            <el-table-column
              label="操作">
            </el-table-column>
          </el-table>
        </div>
        <div v-if="currentKeyType === 'zset'" class="value-info">
          <div style="display: flex;align-items: center;">
            <el-input
              size="small"
              placeholder="请输入内容"
              suffix-icon="el-icon-date"
              style="width: 200px;"
              v-model="hashKeySearch">
            </el-input>
            <el-button type="primary" size="small" @click="updateValue" style="margin-left: auto;">新增</el-button>
          </div>
          <el-table
            :data="currentZSetValue"
            style="width: 100%">
            <el-table-column
              type="index"
              label="序号"
              width="50">
            </el-table-column>
            <el-table-column
              prop="member"
              label="Member"
              width="180">
            </el-table-column>
            <el-table-column
              prop="score"
              label="Score"
              width="180">
            </el-table-column>
            <el-table-column
              label="操作">
            </el-table-column>
          </el-table>
        </div>
        <el-button type="primary" size="small" @click="updateValue" style="float: right;margin-top: 6px;">保存</el-button>
      </div>
      <!-- no key data -->
      <div v-if="currentKey === '' && currentConnection !== '' && !redisInfoVisible" style="flex: 1;height: 100%;margin: 0px 4px">
        <div style="background: #E0E0E0;display: flex;align-items: center;height: 100%;">
          <p style="width: 100%;text-align: center;">请选择一个key值</p>
        </div>
      </div>
    </div>
    <el-dialog title="新建连接" :visible.sync="connectionDialogFormVisible">
      <el-form :model="connectionForm">
<!--        <el-form-item label="连接名称 :">-->
<!--          <el-input size="small" v-model="connectionForm.name" autocomplete="off"></el-input>-->
<!--        </el-form-item>-->
        <el-form-item label="IP :">
          <el-input size="small" v-model="connectionForm.ip" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="端口 :">
          <el-input size="small" v-model="connectionForm.port" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码 :">
          <el-input size="small" v-model="connectionForm.password" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="testConnection" style="float: left">测试连接</el-button>
        <el-button size="small" @click="connectionDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" size="small" @click="saveConnection">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="设置" :visible.sync="settingsDialogFormVisible">
      <div class="settings">
        <p style="margin-left: 5px;font-weight: 500;">风格设置</p>
        <div class="mode" style="display: flex;text-align: center;">
          <div style="padding: 5px;cursor: pointer;" :class="displayMode === 'normal' ? 'checked' : 'normal'" @click="displayMode = 'normal'">
            <img src="https://gw.alipayobjects.com/zos/antfincdn/NQ%24zoisaD2/jpRkZQMyYRryryPNtyIC.svg" alt="light">
            <p style="margin: 0;">常规</p>
          </div>
          <div style="margin-left: 30px;padding: 5px;cursor: pointer;" :class="displayMode === 'dart' ? 'checked' : 'normal'" @click="displayMode = 'dart'">
            <img src="https://gw.alipayobjects.com/zos/antfincdn/hmKaLQvmY2/LCkqqYNmvBEbokSDscrm.svg" alt="realDark">
            <p style="margin: 0;">深色</p>
          </div>
        </div>
        <p style="margin-left: 5px;font-weight: 500;margin-top: 20px;">关于</p>
        <div style="margin-left: 5px;">
          <span>当前版本：  </span><span style="color: rgba(0,0,0,.65);">V1.0.1</span> <el-button size="mini" style="margin-left: 20px;" @click="checkUpdate">检查更新</el-button>
        </div>
        <div style="margin-left: 5px;margin-top: 10px;">
          <span>Github：  </span><a href="#" @click="openUrlWithOsBrowser('https://github.com/david1025')">https://github.com/david1025</a>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="settingsDialogFormVisible = false">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="新建Key-Value" :visible.sync="newKeyDialogFormVisible">
      <el-form :model="connectionForm">
        <el-form-item label="Key">
          <el-input size="small"  v-model="newKeyForm.key" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-select size="small" style="width: 100%"  v-model="newKeyForm.keyType" placeholder="请选择">
            <el-option
              v-for="item in keyTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="newKeyForm.keyType === 'string'" label="Value">
          <el-input size="small"  v-model="newKeyForm.value" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="newKeyDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveKey">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ToolBar from '../components/ToolBar'
const { ipcRenderer } = require('electron')
const Redis = require('ioredis')
const { shell } = require('electron')
export default {
  name: 'Home',
  components: { ToolBar },
  data () {
    return {
      platform: '',
      testNum: 0,
      connectionForm: {
        id: '',
        ip: '',
        port: '',
        password: ''
      },
      connectionDialogFormVisible: false,
      redisInfos: [],
      redisMainInfo: {
        keyCount: 0,
        version: '',
        os: '',
        runDayCount: 0,
        usedMemory: '',
        serverMemory: '',
        clientCount: 0,
        blockedClientCount: 0,
        mode: '',
        memAllocator: ''
      },
      redisInfoVisible: false,
      connections: [],
      keySearch: '',
      keys: [],
      currentConnection: '',
      currentDatabase: '',
      currentKey: '',
      currentKeyType: '',
      currentKeyTtl: '',
      currentValue: '',
      currentHashValue: [],
      currentListValue: [],
      currentSetValue: [],
      currentZSetValue: [],
      hashKeySearch: '',
      newKeyDialogFormVisible: false,
      keyTypeOptions: [
        {
          value: 'string',
          label: 'string'
        }, {
          value: 'hash',
          label: 'hash'
        }, {
          value: 'set',
          label: 'set'
        }, {
          value: 'list',
          label: 'list'
        }, {
          value: 'zset',
          label: 'zset'
        }],
      newKeyForm: {
        key: '',
        keyType: '',
        value: ''
      },
      settingsDialogFormVisible: false,
      displayMode: 'normal'
    }
  },
  mounted () {
    ipcRenderer.send('close')
    this.platform = process.platform
    ipcRenderer.send('showMainWin')
    this.connections = JSON.parse(window.localStorage.getItem('connections')) === null ? [] : JSON.parse(window.localStorage.getItem('connections'))
  },
  methods: {
    redisStatus (index) {
      const _this = this
      let client
      if (this.connections[index].client) {
        this.redisInfoVisible = true
        client = this.connections[index].client
        _this.connections[index].collapse ? _this.connections[index].collapse = false : _this.connections[index].collapse = true
      } else {
        let url = 'redis://'
        if (this.connections[index].password !== '') {
          url += ':' + this.connections[index].password + '@'
        }
        url += this.connections[index].ip + ':' + this.connections[index].port
        client = new Redis(url)
      }
      client.on('error', function (error) {
        console.log(error.code)
        if (error.code === undefined) {
          _this.$message.error('无法连接服务器，请检查连接信息')
        }
        if (error.code === 'ECONNREFUSED') {
          _this.$message.error('无法连接服务器，请检查连接信息')
        }
        if (error.code === 'NOAUTH') {
          _this.$message.error('密码错误')
        }
        if (error.code === 'ECONNRESET') {
          _this.connections[index].client = ''
          _this.currentConnection = ''
          _this.$message.error('连接已断开，请重新连接')
        }
        client.quit()
      })
      client.on('ready', function () {
        // this.$router.push('KeyValues')
        _this.connections[index].collapse ? _this.connections[index].collapse = false : _this.connections[index].collapse = true
        _this.connections[index].connected = true
        _this.connections[index].client = client
        this.redisInfoVisible = true
        client.config('get', 'databases', (err, res) => {
          console.log(res)
          if (!err && res[1]) {
            // eslint-disable-next-line handle-callback-err
            client.monitor(function (err, monitor) {
              console.log(monitor)
              console.log(monitor.serverInfo)
              _this.connections[index].databases = []
              _this.redisMainInfo.keyCount = 0
              for (let i = 0; i < res[1]; i++) {
                let count = monitor.serverInfo['db' + i] === undefined ? '0' : monitor.serverInfo['db' + i]
                if (count !== '0') {
                  count = count.split(',')[0].split('=')[1]
                }
                console.log(count)
                _this.redisMainInfo.keyCount += parseInt(count)
                _this.connections[index].databases.push({
                  id: i,
                  size: count
                })
              }

              _this.redisMainInfo.version = monitor.serverInfo.redis_version
              _this.redisMainInfo.os = monitor.serverInfo.os
              _this.redisMainInfo.runDayCount = monitor.serverInfo.uptime_in_days
              _this.redisMainInfo.serverMemory = monitor.serverInfo.total_system_memory_human
              _this.redisMainInfo.usedMemory = monitor.serverInfo.used_memory_human
              _this.redisMainInfo.clientCount = monitor.serverInfo.connected_clients
              // 阻塞的客户端数量
              _this.redisMainInfo.blockedClientCount = monitor.serverInfo.blocked_clients
              // 运行模式
              _this.redisMainInfo.mode = monitor.serverInfo.redis_mode
              // 内存分配器
              _this.redisMainInfo.memAllocator = monitor.serverInfo.mem_allocator

              for (const key in monitor.serverInfo) {
                _this.redisInfos.push({
                  key: key,
                  value: monitor.serverInfo[key]
                })
              }
            })
          } else {
            console.log(err)
          }
        })
      })
    },
    testConnection () {
      if (this.connectionForm.ip === '') {
        this.$message.error('请输入IP')
        return
      }
      if (this.connectionForm.port === '') {
        this.$message.error('请输入端口号')
        return
      }
      const _this = this
      let url = 'redis://'
      if (this.connectionForm.password !== '') {
        url += ':' + this.connectionForm.password + '@'
      }
      url += this.connectionForm.ip + ':' + this.connectionForm.port
      const client = new Redis(url)
      client.on('error', function (error) {
        console.log(error.code)
        if (error.code === undefined) {
          _this.$message.error('无法连接服务器，请检查连接信息')
        }
        if (error.code === 'ECONNREFUSED') {
          _this.$message.error('无法连接服务器，请检查连接信息')
        }
        if (error.code === 'NOAUTH') {
          _this.$message.error('密码错误')
        }
        client.quit()
      })
      client.on('ready', function () {
        _this.$message.success('连接成功')
        client.quit()
      })
    },
    /**
     * 展示某个db下的所有key
     * @param connectionIndex
     * @param databaseIndex
     * @returns {Promise<void>}
     */
    async showKeyList (connectionIndex, databaseIndex) {
      const redisClient = this.connections[connectionIndex].client
      try {
        // 选择当前选中的数据库
        redisClient.select(databaseIndex)
        this.keys = await redisClient.keys('*')
      } catch (e) {
        redisClient.disconnect(true)
      }
      this.currentConnection = redisClient
      this.currentDatabase = databaseIndex
      this.redisInfoVisible = false
      console.log(this.keys)
    },
    newConnection () {
      this.connectionDialogFormVisible = true
    },
    editConnection (index) {
      this.connectionForm.id = this.connections[index].id
      this.connectionForm.ip = this.connections[index].ip
      this.connectionForm.port = this.connections[index].port
      this.connectionForm.password = this.connections[index].password
      this.connectionDialogFormVisible = true
    },
    saveConnection () {
      if (this.connectionForm.ip === '') {
        this.$message.error('请输入IP')
        return
      }
      if (this.connectionForm.port === '') {
        this.$message.error('请输入端口号')
        return
      }
      if (this.connectionForm.id) {
        this.connections[this.connectionForm.id] = {
          id: this.connectionForm.id,
          ip: this.connectionForm.ip,
          port: this.connectionForm.port,
          password: this.connectionForm.password,
          databases: [],
          collapse: false,
          connected: false
        }
      } else {
        if (this.connectionForm.ip === '') {
          this.$message.error('请输入IP')
          return
        }
        if (this.connectionForm.port === '') {
          this.$message.error('请输入端口号')
          return
        }
        this.connections.push({
          id: this.connections.length,
          ip: this.connectionForm.ip,
          port: this.connectionForm.port,
          password: this.connectionForm.password,
          databases: [],
          collapse: false,
          connected: false
        })
      }
      window.localStorage.setItem('connections', JSON.stringify(this.connections))
      this.connectionDialogFormVisible = false
    },
    refreshConnection (index) {
      const _this = this
      const redisClient = this.connections[index].client
      redisClient.config('get', 'databases', (err, res) => {
        console.log(res)
        if (!err && res[1]) {
          // eslint-disable-next-line handle-callback-err
          redisClient.monitor(function (err, monitor) {
            console.log(monitor.serverInfo)
            _this.connections[index].databases = []
            _this.redisMainInfo.keyCount = 0
            for (let i = 0; i < res[1]; i++) {
              let count = monitor.serverInfo['db' + i] === undefined ? '0' : monitor.serverInfo['db' + i]
              if (count !== '0') {
                count = count.split(',')[0].split('=')[1]
              }
              _this.redisMainInfo.keyCount += parseInt(count)
              _this.connections[index].databases.push({
                id: i,
                size: count
              })
            }

            _this.redisMainInfo.version = monitor.serverInfo.redis_version
            _this.redisMainInfo.os = monitor.serverInfo.os
            _this.redisMainInfo.runDayCount = monitor.serverInfo.uptime_in_days
            _this.redisMainInfo.serverMemory = monitor.serverInfo.total_system_memory_human
            _this.redisMainInfo.usedMemory = monitor.serverInfo.used_memory_human
            _this.redisMainInfo.clientCount = monitor.serverInfo.connected_clients
            // 阻塞的客户端数量
            _this.redisMainInfo.blockedClientCount = monitor.serverInfo.blocked_clients
            // 是否是cluster模式
            _this.redisMainInfo.mode = monitor.serverInfo.redis_mode
            // 内存分配器
            _this.redisMainInfo.memAllocator = monitor.serverInfo.mem_allocator

            _this.redisInfos = []
            for (const key in monitor.serverInfo) {
              _this.redisInfos.push({
                key: key,
                value: monitor.serverInfo[key]
              })
            }
            _this.$message({
              type: 'success',
              message: '刷新成功!'
            })
          })
        } else {
          console.log(err)
        }
      })
    },
    deleteConnection (index) {
      this.$confirm('此操作将永久删除该连接, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(() => {
        this.connections.splice(index, 1)
        window.localStorage.setItem('connections', JSON.stringify(this.connections))
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
      })
    },
    async updateKeys () {
      this.keys = await this.currentConnection.keys('*')
    },
    async saveKey () {
      if (this.newKeyForm.keyType === 'string') {
        this.setValueByType(this.newKeyForm.key, this.newKeyForm.keyType, this.newKeyForm.value)
      }
      if (this.newKeyForm.keyType === 'hash') {
        this.setValueByType(this.newKeyForm.key, this.newKeyForm.keyType, this.newKeyForm.value)
      }
      this.newKeyDialogFormVisible = false
      this.newKeyForm = {
        key: '',
        keyType: '',
        value: ''
      }
      this.updateKeys()
    },
    deleteKey () {
      this.$confirm('此操作将永久删除该key, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(() => {
        this.currentConnection.del(this.currentKey)
        this.currentKey = ''
        this.updateKeys()
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
      })
    },
    setValueByType (key, keyType, value) {
      switch (keyType) {
        case 'string':
          this.currentConnection.set(key, value)
          break
        case 'hash':
          this.currentConnection.hmset(key, value)
          break
        case 'list':
          for (let i = 0; i < value.length; i++) {
            this.currentConnection.lset(key, i, value[i])
          }
          break
        default:
          break
      }
    },
    /**
     * 更新key的名称
     */
    updateKey () {
      this.currentConnection.del(this.currentKey)
    },
    updateValue () {
      this.currentConnection.set(this.currentKey, this.currentValue)
      this.$message({
        message: '更新成功',
        type: 'success'
      })
    },
    async getValue (key) {
      this.currentKey = key
      this.currentKeyType = await this.currentConnection.type(key)
      if (this.currentKeyType === 'none') {
        this.$message.error('该key值不存在')
        this.currentKey = ''
        this.updateKeys()
      }
      this.getValueByType(key, this.currentKeyType)
      this.currentKeyTtl = await this.currentConnection.pttl(key)
    },
    getValueByType (key, type) {
      const _this = this
      switch (type) {
        case 'string':
          this.currentConnection.get(key).then(function (result) {
            _this.currentValue = result
          })
          break
        case 'hash':
          // eslint-disable-next-line no-return-assign
          this.currentConnection.hgetall(key).then(function (result) {
            _this.currentHashValue = []
            for (const key in result) {
              _this.currentHashValue.push({
                key: key,
                value: result[key]
              })
            }
          })
          break
        case 'list':
          // eslint-disable-next-line no-return-assign
          this.currentConnection.lrange(key, 0, 10000).then(function (result) {
            _this.currentListValue = []
            for (let i = 0; i < result.length; i++) {
              _this.currentListValue.push({
                value: result[i]
              })
            }
          })
          break
        case 'set':
          // eslint-disable-next-line no-return-assign
          this.currentConnection.sscan(key, 0, 'COUNT', 10000).then(function (result) {
            _this.currentSetValue = []
            for (let i = 0; i < result[1].length; i++) {
              _this.currentSetValue.push({
                value: result[1][i]
              })
            }
          })
          break
        case 'zset':
          this.currentConnection.zrange(key, 0, 10000, 'WITHSCORES').then(function (result) {
            _this.currentZSetValue = []
            for (let i = 0; i < result.length; i++) {
              _this.currentZSetValue.push({
                member: result[i],
                score: result[i + 1]
              })
              i++
            }
          })
          break
        default:
          break
      }
    },
    openUrlWithOsBrowser (url) {
      shell.openExternal(url)
    },
    checkUpdate () {
      this.$message({
        type: 'success',
        message: '当前版本已是最版版本!'
      })
    }
  }
}
</script>
<style lang="scss">
  .main {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow-y: hidden;
    .mac-bar {
      height: 45px;
      -webkit-app-region: drag;
      display: flex;
      align-items: center;
      .setting {
        margin-left: auto;
        margin-right: 22px;
        font-size: 20px;
        color: #60666d;
      }
    }
    .horizontal-line {
      height: 1px;
      width: 100%;
      background-color: #E0E0E0;
    }
    .vertical-line {
      height: 1px;
      width: 100%;
      background-color: #E0E0E0;
      margin-bottom: 2px;
    }
    .container {
      display: flex;
      height: 100%;
      .connection {
        width: 274px;
        height: 100%;
        .new-connection {
          margin: 15px 25px;
          .btn-new {
            width: 100%;
          }
        }
        .connections {
          height: calc(100% - 110px);
          overflow-y: auto;
          .connection-item {
            display: flex;
            align-items: center;
            cursor: pointer;
            height: 40px;
            img {
              width: 20px;
              height: 20px;
              margin-left: 6px;
            }
            p {
              margin-left: 6px;
              height: 25px;
              line-height: 25px;
              font-weight: 500;
              -webkit-user-select: none;
            }
          }
          .database-item {
            display: flex;
            align-items: center;
            height: 40px;
            padding-right: 15px;
            cursor: pointer;
            color: rgba(0,0,0,.65);
            &:hover {
              background-color: #F0F0F0;
            }
            img {
              width: 20px;
              height: 15px;
              margin-left: 16px;
            }
            p {
              margin-left: 6px;
              -webkit-user-select: none;
            }
            span {
              margin-left: auto;
            }
          }
          .checked {
            color: #1890ff;
            background-color: #e6f7ff;
            font-weight: 500;
            border-right: 3px solid #1890ff;;
          }
        }
        .no-connections {
          height: calc(100% - 50px);
          display: flex;
          align-items: center;
          margin-right: 2px;
          background-color: #f0f2f5;
          p {
            font-size: 14px;
            font-weight: 500;
            color: rgba(0,0,0,.65);
            width: 100%;
            text-align: center;
          }
        }
      }
      .no-connection-data {
        background: #f0f2f5;
        display: flex;
        align-items: center;
        height: 100%;
      }
      .key-list {
        width: 250px;
        height: 100%;
        .search {
          display: flex;
          align-items: center;
          margin: 17px 8px;
          .btn-new-key {
            margin-left: 6px;
          }
        }
      }
      .key-content {
        flex: 1;
        height: 100%;
        background: #f0f2f5;
        .key-info {
          display: flex;
          align-items: center;
          height: 88px;
          margin: 17px 8px;
          padding: 0px 17px;
          background: #FFFFFF;
          .el-input__inner {
            padding: 0 11px !important;
          }
        }
        .value-info {
          margin: 17px 8px;
          background: #FFFFFF;
          padding: 17px 17px;
        }
      }
    }
    .settings {
      .mode{
        .checked {
          box-sizing:border-box;
          border: 1px solid #1890ff;
          border-radius: 4px;
        }
        .normal {
          box-sizing:border-box;
          border: 1px solid #ffffff;
          border-radius: 4px;
        }
      }
    }
  }
  .el-tooltip__popper {
    max-width: 200px !important;
  }
  .el-dialog {
    width: 520px !important;
  }
  .el-dialog__header {
    border-bottom: 1px solid #f0f0f0;
    padding: 16px 24px !important;
  }
  .el-dialog__title {
    font-size: 16px !important;
    font-weight: 500 !important;
  }
  .el-dialog__footer {
    border-top: 1px solid #f0f0f0;
    padding: 10px 16px !important;
  }
  .el-form-item {
    display: flex;
  }
  .el-form-item__label {
    flex: 0 0 20.83333333%;
    max-width: 20.83333333%;
    color: rgba(0,0,0,.85) !important;
  }
  .el-form-item__content {
    flex: 1 1;
    max-width: 62.5%;
  }

</style>
