<template>
  <div class="main">
    <div style="height: 30px;">
      <tool-bar/>
    </div>
    <div style="height: 1px;width: 100%;background-color: #E0E0E0;"></div>
    <div style="display: flex;height: calc(100% - 30px);">
      <div style="width: 274px;height: 100%;">
        <div style="margin: 3px 3px;">
          <el-button style="width: 100%;" type="primary" icon="el-icon-circle-plus-outline" @click="newConnection">添加Redis连接</el-button>
        </div>
        <div style="height: 1px;width: 100%;background-color: #E0E0E0;margin-bottom: 2px;"></div>
        <div style="height: calc(100% - 50px);overflow-y: auto;margin-right: 2px;">
        <div v-for="(item,index) in connections" :key="item.id">
          <div style="display: flex;align-items: center;cursor: pointer;height: 35px;" @click="redisStatus(index)">
            <img style="width: 20px;height: 20px;margin-left: 6px;" src="../assets/icon_redis.png">
            <p style="margin-left: 6px;height: 25px;line-height: 25px;font-weight: 500;-webkit-user-select: none;">{{item.ip}}@{{item.port}}</p>
            <div style="margin-left: auto;" >
              <i v-if="item.connected" style="margin-left: 6px;" class="el-icon-refresh-right" @click.stop="refreshConnection(index)"></i>
              <i v-if="item.connected" style="margin-left: 6px;" class="el-icon-edit-outline" @click.stop="editConnection(index)"></i>
              <i v-if="item.connected" style="margin-left: 6px;" class="el-icon-delete" @click.stop="deleteConnection(index)"></i>
              <i v-if="!item.collapse" style="margin-left: 6px;margin-right: 10px;" class="el-icon-arrow-right"></i>
              <i v-if="item.collapse" style="margin-left: 6px;margin-right: 10px;" class="el-icon-arrow-down"></i>
            </div>
          </div>
          <div v-if="item.collapse">
            <div v-for="(database,databaseIndex) in item.databases" :key="database.id"
                 style="display: flex;align-items: center;height: 35px;cursor: pointer;"
                 @click="showKeyValues(index, databaseIndex)">
              <img style="width: 20px;height: 15px;margin-left: 16px;" src="../assets/icon_database.png">
              <p style="margin-left: 6px;-webkit-user-select: none;">db{{database.id}} ({{database.size}})</p>
            </div>
          </div>
        </div>
        </div>
      </div>
      <div style="width: 1px;height: 100%;background-color: #E0E0E0;margin-bottom: 4px;"></div>
      <div style="width: 230px;height: 100%;margin-left: 3px;margin-right: 3px;">
        <el-input placeholder="请输key" v-model="keySearch" class="input-with-select" style="margin-top: 3px;">
          <el-button slot="append" icon="el-icon-search"></el-button>
        </el-input>
        <div>
          <div style="display: flex;align-items: center;cursor: pointer;height: 35px;">
            <img src="../assets/icon_key.png" style="width: 20px;height: 20px;margin-left: 6px;">
            <p style="margin-left: 6px;height: 25px;line-height: 25px;font-weight: 500;-webkit-user-select: none;">corpId</p>
          </div>
        </div>
      </div>
      <div style="width: 1px;height: 100%;background-color: #E0E0E0;margin-bottom: 4px;"></div>
      <div style="flex: 1;height: 100%;margin: 0px 4px">
        <div style="display: flex;align-items: center;margin-top: 3px;">
          <el-input style="width: 250px;">
            <template slot="prepend">Key</template>
          </el-input>
          <el-input style="width: 250px;margin-left: 10px;">
            <template slot="prepend">TTL</template>
          </el-input>
          <el-button type="primary" size="small" icon="el-icon-edit-outline" circle style="margin-left: 10px;"></el-button>
          <el-button type="success" size="small" icon="el-icon-check" circle style="margin-left: 10px;"></el-button>
          <el-button type="danger" size="small" icon="el-icon-delete" circle style="margin-left: 10px;"></el-button>
        </div>
        <div style="margin-top: 10px;">
          <span>键值</span>
        </div>
        <div style="margin-top: 10px;">
          <el-input
            type="textarea"
            :autosize="{ minRows: 20, maxRows: 30}"
            placeholder="请输入内容">
          </el-input>
        </div>
        <el-button type="primary" size="small" style="float: right;margin-top: 6px;">保存</el-button>
      </div>
    </div>
    <el-dialog title="新建连接" :visible.sync="connectionDialogFormVisible">
      <el-form :model="connectionForm">
<!--        <el-form-item label="连接名称">-->
<!--          <el-input v-model="connectionForm.name" autocomplete="off"></el-input>-->
<!--        </el-form-item>-->
        <el-form-item label="IP">
          <el-input v-model="connectionForm.ip" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="端口">
          <el-input v-model="connectionForm.port" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="connectionForm.password" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="connectionDialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveConnection">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ToolBar from '../components/ToolBar'
const { ipcRenderer } = require('electron')
const Redis = require('ioredis')
export default {
  name: 'Home',
  components: { ToolBar },
  data () {
    return {
      testNum: 0,
      connectionForm: {
        id: '',
        ip: '',
        port: '',
        password: ''
      },
      connectionDialogFormVisible: false,
      connections: [
        {
          id: 1,
          ip: '106.2.13.200',
          port: '6399',
          password: 'R@d1s',
          databases: [],
          collapse: false,
          connected: false
        },
        {
          id: 2,
          ip: '127.0.0.1',
          port: '6379',
          password: '',
          databases: [],
          collapse: false,
          connected: false
        }
      ],
      keySearch: ''
    }
  },
  mounted () {
    ipcRenderer.send('changWindowSize')
    ipcRenderer.send('center')
  },
  methods: {
    redisStatus (index) {
      const _this = this
      let client
      if (this.connections[index].client) {
        client = this.connections[index].client
        _this.connections[index].collapse ? _this.connections[index].collapse = false : _this.connections[index].collapse = true
      } else {
        // client = redis.createClient(this.connections[index].port, this.connections[index].ip)
        let url = 'redis://'
        if (this.connections[index].password !== '') {
          url += ':' + this.connections[index].password + '@'
        }
        url += this.connections[index].ip + ':' + this.connections[index].port
        client = new Redis(url)
      }
      client.on('error', function (error) {
        console.log(error.code)
        if (error.code === 'ECONNREFUSED') {
          _this.$message.error('无法连接服务器')
        }
        if (error.code === 'NOAUTH') {
          _this.$message.error('密码错误')
        }
        client.quit()
      })
      client.on('ready', function () {
        // this.$router.push('KeyValues')
        _this.connections[index].collapse ? _this.connections[index].collapse = false : _this.connections[index].collapse = true
        _this.connections[index].connected = true
        _this.connections[index].client = client
        // eslint-disable-next-line handle-callback-err
        // client.monitor(function (err, monitor) {
        //   monitor.on('monitor', function (time, args, source, database) {
        //     console.log(database)
        //   })
        // })

        client.config('get', 'databases', (err, res) => {
          console.log(res)
          if (!err && res[1]) {
            console.log(res[1])
            // eslint-disable-next-line handle-callback-err
            client.monitor(function (err, monitor) {
              console.log(monitor.serverInfo)
              for (let i = 0; i < res[1]; i++) {
                let count = monitor.serverInfo['db' + i] === undefined ? '0' : monitor.serverInfo['db' + i]
                if (count !== '0') {
                  count = count.split(',')[0].split('=')[1]
                }
                _this.connections[index].databases.push({
                  id: i,
                  size: count
                })
              }
            })
          } else {
            console.log(err)
          }
        })

        // eslint-disable-next-line handle-callback-err
        client.monitor(function (err, res) {
          console.log(res) // ok
        })
      })
    },
    async showKeyValues (connectionIndex, databaseIndex) {
      const _this = this
      console.log('######################')
      const redisClient = this.connections[connectionIndex].client
      const keys = await redisClient.keys('*')
      redisClient.get('successMap', function (err, result) {
        // eslint-disable-next-line no-debugger
        debugger
        if (err) {
          console.error(err)
        } else {
          console.log(result) // Promise resolves to "bar"
        }
      })
      console.log(keys)
      let value = await redisClient.get('token')
      console.log(value)
      value = await redisClient.get('successMap')
      console.log(value)
      _this.$router.push('KeyValues')
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
      this.connectionDialogFormVisible = false
    },
    refreshConnection () {
      this.$message({
        type: 'success',
        message: '刷新成功!'
      })
    },
    deleteConnection (index) {
      this.$confirm('此操作将永久删除该连接, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(() => {
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    deleteKey () {
    },
    updateKey () {
    },
    updateValue () {
    },
    getValue () {
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
  }
</style>
