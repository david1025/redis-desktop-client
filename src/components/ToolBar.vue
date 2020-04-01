<template>
  <div class="main">

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
    <div style="margin-right: auto;margin-left: 6px;display: flex;align-items: center;">
      <img src="../assets/icon_logo.png"/>
      <span style="font-size: 14px;margin-left: 6px;">Redis Desktop Client</span>
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = require('electron')
export default {
  name: 'ToolBar',
  data () {
    return {
      max: false
    }
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
    }
  }
}
</script>

<style lang="scss" scoped>
.main {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  -webkit-app-region: drag;
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
</style>
