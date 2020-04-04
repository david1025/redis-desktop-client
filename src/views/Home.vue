<template>
  <div class="main">
    <div v-if="platform !== 'darwin'" class="win-bar">
      <div class="item close" @click="close">
        <i class="el-icon-close" style="font-size: 15px;font-weight: 500"></i>
      </div>
      <div v-if="!max" class="item" @click="maximize">
        <i class="el-icon-full-screen" style="font-size: 13px;font-weight: 500"></i>
      </div>
      <div v-if="max" class="item" @click="unmaximize">
        <img style="width: 10px;height: 10px;" src="../assets/icon_window.png">
      </div>
      <div class="item" @click="minimize">
        <i class="el-icon-minus" style="font-size: 14px;font-weight: 500"></i>
      </div>
      <div class="item" @click="settingsDialogFormVisible = true">
        <i class="el-icon-setting setting" style="font-size: 14px;font-weight: 500"></i>
      </div>
      <div style="margin-right: auto;margin-left: 6px;display: flex;align-items: center;">
        <img src="../assets/icon_logo.png"/>
        <span style="font-size: 14px;margin-left: 6px;">Redis Desktop Client</span>
      </div>
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
            <div class="connection-item" @dblclick="redisStatus(index)" @click="redisInfoVisible = true" @contextmenu="openMenu($event, index)">
              <img v-if="item.connected" src="../assets/icon_redis.png">
              <img v-if="!item.connected" src="../assets/icon_redis_gery.png">
              <p>{{item.ip}}@{{item.port}}</p>
              <div style="margin-left: auto;" >
                <i v-if="item.connected" style="margin-left: 6px;" class="el-icon-refresh-right" @click.stop="refreshConnection(index)"></i>
                <i v-if="item.connected" style="margin-left: 6px;" class="el-icon-edit-outline" @click.stop="editConnection(index)"></i>
                <i style="margin-left: 6px;" class="el-icon-delete" @click.stop="deleteConnection(index)"></i>
                <i v-if="!item.collapse" style="margin-left: 6px;margin-right: 10px;" class="el-icon-arrow-right" @click.stop="item.collapse = true"></i>
                <i v-if="item.collapse" style="margin-left: 6px;margin-right: 10px;" class="el-icon-arrow-down" @click.stop="item.collapse = false"></i>
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
      <div v-if="redisInfoVisible && currentConnection !== ''" style="background: #f0f2f5;flex: 1;height: calc(100% - 32px);overflow-y: auto;">
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
            @input="searchKey"
            v-model="keySearch">
          </el-input>
          <el-button size="mini" icon="el-icon-plus" class="btn-new-key" @click="newKeyDialogFormVisible = true"></el-button>
        </div>
        <div class="vertical-line"></div>
        <div class="content">
          <div v-for="item in showKeys" :key="item" class="item" :class="currentKey === item ? 'checked' : ''" @click="getValue(item)">
            <img src="../assets/icon_key.png">
            <el-tooltip class="item" effect="dark" :content="item" placement="bottom-start">
              <p>
                {{item}}
              </p>
            </el-tooltip>
            <i class="el-icon-delete delete" @click="deleteKey"></i>
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
          <el-input size="small" v-model="currentKeyTtl" style="width: 80px;margin-left: 4px;">
          </el-input>
          <div style="margin-left: auto;">
            <el-button type="primary" size="small" icon="el-icon-edit-outline" style="margin-left: 10px;" @click="openUpdateKeyDialog">编辑</el-button>
            <el-button type="primary" size="small" icon="el-icon-refresh-right" style="margin-left: 10px;" @click="getValue(currentKey)">刷新键值</el-button>
          </div>
        </div>
        <div style="background-color: #ffffff;margin: 8px;padding: 8px 0px;border-radius: 4px;height: calc(100% - 176px);overflow-y: auto;">
          <div style="margin: 0px 16px 12px 16px;display: flex;align-items: center;height: 40px;">
            <span style="font-size: 14px;font-weight: 500;">Value</span>
            <el-button v-show="currentKeyType === 'string'" type="primary" size="small" @click="updateValue" style="margin-left: auto;margin-top: 6px;">保存</el-button>
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
              <el-button type="primary" size="small" @click="openHashValueDialog">新增</el-button>
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
                label="KEY">
              </el-table-column>
              <el-table-column
                prop="value"
                label="VALUE">
              </el-table-column>
              <el-table-column
                label=""
                width="80">
                <template slot-scope="scope">
                  <i class="el-icon-edit-outline" style="font-size: 16px;" @click="editHashValue(scope.row)"></i>
                  <i class="el-icon-delete" style="margin-left: 8px;font-size: 16px;" @click="deleteHashValue(scope.row)"></i>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-if="currentKeyType === 'list'" class="value-info">
            <div style="display: flex;align-items: center;">
              <el-button type="primary" size="small" @click="openOtherValueDialog">新增</el-button>
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
                label="VALUE">
              </el-table-column>
              <el-table-column
                label="操作" width="80">
                <template slot-scope="scope">
                  <i class="el-icon-edit-outline" style="font-size: 16px;" @click="editOtherValue(scope.row, scope.$index)"></i>
                  <i class="el-icon-delete" style="margin-left: 8px;font-size: 16px;" @click="deleteListValue(scope.$index)"></i>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-if="currentKeyType === 'set'" class="value-info">
            <div style="display: flex;align-items: center;">
              <el-button type="primary" size="small" @click="openOtherValueDialog">新增</el-button>
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
                label="VALUE">
              </el-table-column>
              <el-table-column
                label="操作">
                <template slot-scope="scope">
                  <i class="el-icon-edit-outline" style="font-size: 16px;" @click="editOtherValue(scope.row, '')"></i>
                  <i class="el-icon-delete" style="margin-left: 8px;font-size: 16px;" @click="deleteSetValue(scope.row.value)"></i>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-if="currentKeyType === 'zset'" class="value-info">
            <div style="display: flex;align-items: center;">
              <el-button type="primary" size="small" @click="openOtherValueDialog">新增</el-button>
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
                prop="value"
                label="Value">
              </el-table-column>
              <el-table-column
                prop="score"
                label="Score">
              </el-table-column>
              <el-table-column
                label="操作">
                <template slot-scope="scope">
                  <i class="el-icon-edit-outline" style="font-size: 16px;" @click="editOtherValue(scope.row, '')"></i>
                  <i class="el-icon-delete" style="margin-left: 8px;font-size: 16px;" @click="deleteZSetValue(scope.row.value)"></i>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
      <!-- no key data -->
      <div v-if="currentKey === '' && currentConnection !== '' && !redisInfoVisible" style="flex: 1;height: 100%;">
        <div style="background: #f0f2f5;display: flex;align-items: center;height: 100%;">
          <p style="width: 100%;text-align: center;">请选择一个key值</p>
        </div>
      </div>
    </div>
    <el-dialog title="新建连接" :close-on-click-modal="false" :visible.sync="connectionDialogFormVisible">
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
    <el-dialog title="设置" :close-on-click-modal="false" :visible.sync="settingsDialogFormVisible">
      <div class="settings">
<!--        <p style="margin-left: 5px;font-weight: 500;">风格设置</p>-->
<!--        <div class="mode" style="display: flex;text-align: center;">-->
<!--          <div style="padding: 5px;cursor: pointer;" :class="displayMode === 'normal' ? 'checked' : 'normal'" @click="displayMode = 'normal'">-->
<!--            <img src="https://gw.alipayobjects.com/zos/antfincdn/NQ%24zoisaD2/jpRkZQMyYRryryPNtyIC.svg" alt="light">-->
<!--            <p style="margin: 0;">常规</p>-->
<!--          </div>-->
<!--          <div style="margin-left: 30px;padding: 5px;cursor: pointer;" :class="displayMode === 'dart' ? 'checked' : 'normal'" @click="displayMode = 'dart'">-->
<!--            <img src="https://gw.alipayobjects.com/zos/antfincdn/hmKaLQvmY2/LCkqqYNmvBEbokSDscrm.svg" alt="realDark">-->
<!--            <p style="margin: 0;">深色</p>-->
<!--          </div>-->
<!--        </div>-->
        <p style="margin-left: 5px;font-weight: 500;margin-top: 0px;font-size: 15px;">关于</p>
        <div style="margin-left: 5px;">
          <span>当前版本：  </span><span style="color: rgba(0,0,0,.65);">V1.0.0</span>
<!--          <el-button size="mini" style="margin-left: 20px;" @click="checkUpdate">检查更新</el-button>-->
        </div>
        <div style="margin-left: 5px;margin-top: 10px;">
          <span>Github：  </span><a href="#" @click="openUrlWithOsBrowser('https://github.com/david1025')">https://github.com/david1025</a>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" size="small" @click="settingsDialogFormVisible = false">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="新建Key-Value" :close-on-click-modal="false" :visible.sync="newKeyDialogFormVisible">
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
        <el-form-item v-if="newKeyForm.keyType === 'zset'" label="分数">
          <el-input size="small"  v-model="newKeyForm.score" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item v-if="newKeyForm.keyType !== 'hash'" label="Value">
          <el-input size="small"  v-model="newKeyForm.value" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item v-if="newKeyForm.keyType === 'hash'" label="HASH-KEY">
          <el-input size="small"  v-model="newKeyForm.hashKey" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item v-if="newKeyForm.keyType === 'hash'" label="HASH-Value">
          <el-input size="small"  v-model="newKeyForm.hashValue" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="newKeyDialogFormVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="saveKey">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="修改Key名称" :close-on-click-modal="false" :visible.sync="updateKeyAndTTLFormVisible">
      <el-form :model="updateKeyAndTTLForm">
        <el-form-item label="Key">
          <el-input size="small"  v-model="updateKeyAndTTLForm.key" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="TTL">
          <el-input size="small"  v-model="updateKeyAndTTLForm.ttl" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="updateKeyAndTTLFormVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="editKeyAndTTL">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="修改Key" :close-on-click-modal="false" :visible.sync="hashValueFormVisible">
      <el-form :model="hashValueForm">
        <el-form-item label="Key">
          <el-input size="small"  v-model="hashValueForm.key" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="Value">
          <el-input size="small"  v-model="hashValueForm.value" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="hashValueFormVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="addOrUpdateHashValue">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="修改Key" :close-on-click-modal="false" :visible.sync="otherValueFormVisible">
      <el-form :model="otherValueForm">
        <el-form-item v-if="currentKeyType === 'zset'" label="分数">
          <el-input size="small"  v-model="otherValueForm.score" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="Value">
          <el-input size="small"  v-model="otherValueForm.value" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="otherValueFormVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="addOrUpdateOtherValue(currentKeyType)">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
const { remote, ipcRenderer } = require('electron')
const { Menu, MenuItem } = remote
const Redis = require('ioredis')
const { shell } = require('electron')
export default {
  name: 'Home',
  data () {
    return {
      platform: '',
      max: false,
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
      showKeys: [],
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
        score: '',
        value: '',
        hashKey: '',
        hashValue: ''
      },
      newHashValue: [],
      newListValue: [],
      newSetValue: [],
      newZSetValue: [],
      updateKeyAndTTLFormVisible: false,
      updateKeyAndTTLForm: {
        key: '',
        ttl: '-1'
      },
      settingsDialogFormVisible: false,
      displayMode: 'normal',
      hashValueFormVisible: false,
      hashValueForm: {
        key: '',
        value: '',
        oldKey: ''
      },
      otherValueFormVisible: false,
      otherValueForm: {
        value: '',
        oldValue: '',
        score: '',
        index: ''
      }
    }
  },
  mounted () {
    ipcRenderer.send('close')
    this.platform = process.platform
    ipcRenderer.send('showMainWin')
    this.connections = JSON.parse(window.localStorage.getItem('connections')) === null ? [] : JSON.parse(window.localStorage.getItem('connections'))
  },
  methods: {
    minimize () {
      ipcRenderer.send('minimize')
    },
    maximize () {
      ipcRenderer.send('maximize')
      this.max = true
    },
    unmaximize () {
      ipcRenderer.send('unmaximize')
      this.max = false
    },
    close () {
      ipcRenderer.send('closeMainWin')
    },
    redisStatus (index) {
      const _this = this
      let client
      if (this.connections[index].client) {
        this.redisInfoVisible = true
        client = this.connections[index].client
        // _this.connections[index].collapse ? _this.connections[index].collapse = false : _this.connections[index].collapse = true
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
          _this.$message.error('连接已断开，请重新连接')
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
    openMenu (e, index) {
      const _this = this
      const menu = new Menu()
      if (this.connections[index].client) {
        menu.append(new MenuItem({
          label: '关闭连接',
          click () {
            // 向主进程发送要打开审查的命令
            if (_this.connections[index].client === _this.currentConnection) {
              _this.currentConnection = ''
              _this.currentDatabase = ''
              _this.currentKey = ''
              _this.keys = []
              _this.showKeys = []
            }
            _this.connections[index].client = null
            _this.connections[index].databases = []
            _this.connections[index].connected = false
            _this.connections[index].collapse = false
          }
        }))
        menu.append(new MenuItem({ type: 'separator' }))
        menu.append(new MenuItem({
          label: '刷新',
          click () {
            // 向主进程发送要打开审查的命令
            _this.refreshConnection(index)
          }
        }))
        menu.append(new MenuItem({ type: 'separator' }))
      } else {
        menu.append(new MenuItem({
          label: '打开连接',
          click () {
            // 向主进程发送要打开审查的命令
            _this.redisStatus(index)
          }
        }))
        menu.append(new MenuItem({ type: 'separator' }))
      }
      menu.append(new MenuItem({
        label: '删除连接',
        click () {
          _this.deleteConnection(index)
        }
      }))
      this.mX = e.pageX
      this.mY = e.pageY
      e.preventDefault()
      menu.popup({ window: remote.getCurrentWindow() })
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
        this.showKeys = this.keys
      } catch (e) {
        redisClient.disconnect(true)
      }
      this.currentConnection = redisClient
      this.currentDatabase = databaseIndex
      this.redisInfoVisible = false
    },
    searchKey (val) {
      if (val && val !== '') {
        this.showKeys = []
        for (let i = 0; this.keys.length; i++) {
          if (this.keys[i].indexOf(val) >= 0) {
            this.showKeys.push(this.keys[i])
          }
        }
      } else {
        this.showKeys = this.keys
      }
    },
    async updateKeys () {
      this.keys = await this.currentConnection.keys('*')
      this.showKeys = this.keys
    },
    async saveKey () {
      if (this.newKeyForm.keyType === 'string') {
        this.setValueByType(this.newKeyForm.key, this.newKeyForm.keyType, this.newKeyForm.value)
      }
      if (this.newKeyForm.keyType === 'hash') {
        const hashKey = this.newKeyForm.hashKey
        const hashValue = this.newKeyForm.hashValue
        const value = {}
        value[hashKey] = hashValue
        this.setValueByType(this.newKeyForm.key, this.newKeyForm.keyType, value)
      }
      if (this.newKeyForm.keyType === 'list') {
        this.setValueByType(this.newKeyForm.key, this.newKeyForm.keyType, this.newKeyForm.value)
      }
      if (this.newKeyForm.keyType === 'set') {
        this.setValueByType(this.newKeyForm.key, this.newKeyForm.keyType, this.newKeyForm.value)
      }
      if (this.newKeyForm.keyType === 'zset') {
        this.setValueByType(this.newKeyForm.key, this.newKeyForm.keyType, this.newKeyForm.value, this.newKeyForm.score)
      }
      this.newKeyDialogFormVisible = false
      this.newKeyForm = {
        key: '',
        keyType: '',
        value: ''
      }
      // this.refreshConnection()
      this.updateKeys()
    },
    openUpdateKeyDialog () {
      this.updateKeyAndTTLForm.key = this.currentKey
      this.updateKeyAndTTLForm.ttl = this.currentKeyTtl
      this.updateKeyAndTTLFormVisible = true
    },
    editKeyAndTTL () {
      if (this.updateKeyAndTTLForm.key === '') {
        this.$message.error('请输入KEY')
        return
      }
      if (this.updateKeyAndTTLForm.ttl === '') {
        this.$message.error('请输入TTL')
        return
      }
      if (this.updateKeyAndTTLForm.key === this.currentKey) {
        if (parseInt(this.updateKeyAndTTLForm.ttl) !== this.currentKeyTtl) {
          if (parseInt(this.updateKeyAndTTLForm.ttl) >= 0) {
            this.currentConnection.pexpire(this.updateKeyAndTTLForm.key, this.updateKeyAndTTLForm.ttl)
            this.currentKeyTtl = this.updateKeyAndTTLForm.ttl
          } else {
            this.currentConnection.persist(this.currentKey)
            this.currentKeyTtl = -1
          }
        }
        this.$message({
          type: 'success',
          message: '更新成功!'
        })
        this.updateKeyAndTTLFormVisible = false
        this.updateKeys()
        return
      }
      this.currentConnection.exists(this.updateKeyAndTTLForm.key).then(exists => {
        if (exists) {
          this.$confirm('当前key已经存在, 是否覆盖?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.currentConnection.exists(this.currentKey).then(exists => {
              if (exists) {
                if (this.updateKeyAndTTLForm.key !== this.currentKey) {
                  this.currentConnection.rename(this.currentKey, this.updateKeyAndTTLForm.key)
                  this.currentKey = this.updateKeyAndTTLForm.key
                }
                if (parseInt(this.updateKeyAndTTLForm.ttl) !== this.currentKeyTtl) {
                  if (parseInt(this.updateKeyAndTTLForm.ttl) >= 0) {
                    this.currentConnection.pexpire(this.updateKeyAndTTLForm.key, this.updateKeyAndTTLForm.ttl)
                    this.currentKeyTtl = this.updateKeyAndTTLForm.ttl
                  } else {
                    this.currentConnection.persist(this.currentKey)
                    this.currentKeyTtl = -1
                  }
                }
                this.$message({
                  type: 'success',
                  message: '更新成功!'
                })
              } else {
                this.$message.error('该key已被删除')
              }
              this.updateKeyAndTTLFormVisible = false
              this.updateKeys()
            })
          }).catch(() => {
          })
        }
      }).then(() => {
        this.currentConnection.exists(this.currentKey).then(exists => {
          if (exists) {
            if (this.updateKeyAndTTLForm.key !== this.currentKey) {
              this.currentConnection.rename(this.currentKey, this.updateKeyAndTTLForm.key)
              this.currentKey = this.updateKeyAndTTLForm.key
            }
            if (parseInt(this.updateKeyAndTTLForm.ttl) !== this.currentKeyTtl) {
              if (parseInt(this.updateKeyAndTTLForm.ttl) >= 0) {
                this.currentConnection.pexpire(this.updateKeyAndTTLForm.key, this.updateKeyAndTTLForm.ttl)
                this.currentKeyTtl = this.updateKeyAndTTLForm.ttl
              } else {
                this.currentConnection.persist(this.currentKey)
                this.currentKeyTtl = -1
              }
              this.currentKeyTtl = this.updateKeyAndTTLForm.ttl
            }
            this.$message({
              type: 'success',
              message: '更新成功!'
            })
          } else {
            this.$message.error('该key已被删除')
          }
          this.updateKeys()
          this.updateKeyAndTTLFormVisible = false
        })
      })
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
    async setValueByType (key, keyType, value, score) {
      switch (keyType) {
        case 'string':
          this.currentConnection.set(key, value)
          break
        case 'hash':
          this.currentConnection.hmset(key, value)
          break
        case 'list':
          await this.currentConnection.lpush(key, value)
          break
        case 'set':
          this.currentConnection.sadd(key, value)
          break
        case 'zset':
          this.currentConnection.zadd(key, score, value)
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
      try {
        this.currentConnection.defineCommand('lremindex', {
          numberOfKeys: 1,
          lua: 'local FLAG = "$$#__@DELETE@_REDIS_@PRO@__#$$" redis.call("lset", KEYS[1], ARGV[1], FLAG) redis.call("lrem", KEYS[1], 1, FLAG)'
        })
        this.currentKey = key
        this.currentKeyType = await this.currentConnection.type(key)
        if (this.currentKeyType === 'none') {
          this.$message.error('该key值不存在')
          this.currentKey = ''
          this.updateKeys()
        }
        this.getValueByType(key, this.currentKeyType)
        this.currentKeyTtl = await this.currentConnection.pttl(key)
      } catch (e) {
        this.$message.error('连接已断开，请重新连接')
      }
    },
    openHashValueDialog () {
      this.hashValueForm.key = ''
      this.hashValueForm.value = ''
      this.hashValueForm.oldKey = ''
      this.hashValueFormVisible = true
    },
    addOrUpdateHashValue () {
      const hashKey = this.hashValueForm.key
      const hashValue = this.hashValueForm.value
      const value = {}
      value[hashKey] = hashValue
      if (this.hashValueForm.oldKey !== '') {
        this.currentConnection.hdel(this.currentKey, this.hashValueForm.oldKey)
      }
      this.setValueByType(this.currentKey, 'hash', value)

      this.hashValueForm.key = ''
      this.hashValueForm.value = ''
      this.hashValueForm.oldKey = ''
      this.$message({
        type: 'success',
        message: '成功!'
      })
      this.hashValueFormVisible = false
      this.getValue(this.currentKey)
    },
    editHashValue (row) {
      this.hashValueForm.key = row.key
      this.hashValueForm.value = row.value
      this.hashValueForm.oldKey = row.key
      this.hashValueFormVisible = true
    },
    deleteHashValue (row) {
      this.$confirm('此操作将永久删除该行数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(() => {
        this.currentConnection.hdel(this.currentKey, row.key)
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
        this.getValue(this.currentKey)
      }).catch(() => {
      })
    },
    openOtherValueDialog () {
      this.otherValueForm.value = ''
      this.otherValueFormVisible = true
    },
    editOtherValue (row, index) {
      this.otherValueForm.value = row.value
      this.otherValueForm.oldValue = row.value
      this.otherValueForm.index = index
      this.otherValueFormVisible = true
    },
    addOrUpdateOtherValue (keyType) {
      if (this.otherValueForm.value === '') {
        this.$message.error('值不能为空')
        return
      }
      if (this.otherValueForm.index !== '') {
        this.currentConnection.lset(this.currentKey, this.otherValueForm.index, this.otherValueForm.value)
      } else {
        if (this.currentKeyType === 'zset') {
          this.currentConnection.zrem(this.currentKey, this.otherValueForm.oldValue)
        }
        if (this.currentKeyType === 'set') {
          this.currentConnection.srem(this.currentKey, this.otherValueForm.oldValue)
        }
        this.setValueByType(this.currentKey, keyType, this.otherValueForm.value, this.otherValueForm.score)
      }
      this.$message({
        type: 'success',
        message: '成功!'
      })
      this.otherValueForm.value = ''
      this.otherValueForm.index = ''
      this.otherValueFormVisible = false
      this.getValue(this.currentKey)
    },
    deleteListValue (index) {
      this.$confirm('此操作将永久删除该行数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(() => {
        console.log(index)
        this.currentConnection.lremindex(this.currentKey, index)
        this.$message({
          type: 'success',
          message: '成功!'
        })
        this.getValue(this.currentKey)
      }).catch(() => {
      })
    },
    deleteSetValue (value) {
      this.$confirm('此操作将永久删除该行数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(() => {
        this.currentConnection.srem(this.currentKey, value)
        this.$message({
          type: 'success',
          message: '成功!'
        })
        this.getValue(this.currentKey)
      }).catch(() => {
      })
    },
    deleteZSetValue (value) {
      console.log(value)
      this.$confirm('此操作将永久删除该行数据, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(() => {
        this.currentConnection.zrem(this.currentKey, value)
        this.$message({
          type: 'success',
          message: '成功!'
        })
        this.getValue(this.currentKey)
      }).catch(() => {
      })
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
                value: result[i],
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
    .win-bar {
      display: flex;
      flex-direction: row-reverse;
      align-items: center;
      -webkit-app-region: drag;
      height: 30px;
      background: #ffffff;
      .item {
        height: 100%;
        cursor: pointer;
        padding-left: 15px;
        padding-right: 15px;
        display: flex;
        align-items: center;
        -webkit-app-region: no-drag;

        &:hover {
          background-color: #F0F0F0;
        }
      }
      .close {
        &:hover {
          background-color: red;

          i {
            color: white;
          }
        }
      }
    }
    .mac-bar {
      height: 45px;
      -webkit-app-region: drag;
      display: flex;
      align-items: center;
      background: #ffffff;
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
      background: #FFFFFF;
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
              margin-left: 8px;
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
            -webkit-user-select: none;
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
        .content {
          height: calc(100% - 110px);
          overflow-y: auto;
          .item {
            display: flex;
            align-items: center;
            cursor: pointer;
            height: 35px;
            img {
              width: 20px;
              height: 20px;
              margin-left: 8px;
            }
            p {
              margin-left: 6px;
              height: 25px;
              line-height: 25px;
              font-weight: 500;
              -webkit-user-select: none;
              overflow: hidden;
              text-overflow:ellipsis;
              white-space: nowrap;
            }
            .delete {
              margin-left: auto;
              padding: 0px 8px;
              &:hover {
                color: red;
              }
            }
          }
          .checked {
            background-color: #e6f7ff;
            font-weight: 500;
          }
        }
      }
      .key-content {
        flex: 1;
        background: #f0f2f5;
        .key-info {
          display: flex;
          align-items: center;
          height: 88px;
          margin: 8px 8px;
          padding: 0px 17px;
          background: #FFFFFF;
          border-radius: 4px;
          .el-input__inner {
            padding: 0 11px !important;
          }
        }
        .value-info {
          margin: 8px 0px;
          background: #FFFFFF;
          padding: 0px 17px;
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
