<template>
  <div class="main">

    <div class="item" @click="close">
      <img style="width: 10px;height: 10px;" src="../assets/icon_close.png">
    </div>
    <div class="item">
      <img style="width: 10px;height: 10px;" src="../assets/icon_max.png">
    </div>
    <div class="item">
      <img style="width: 10px;height: 10px;" src="../assets/icon_windows.png">
    </div>
    <div class="item" @click="minimize">
      <i class="el-icon-minus"></i>
<!--      <img style="width: 10px;height: 10px;" src="../assets/icon_min.png">-->
    </div>
    <div style="margin-right: auto;font-size: 14px;margin-left: 6px;">Redis Desktop Client</div>
  </div>
</template>

<script>
const { ipcRenderer } = require('electron')
export default {
  name: 'ToolBar',
  methods: {
    minimize () {
      console.log(process.platform)
      ipcRenderer.send('minimize')
    },
    close () {
      ipcRenderer.send('close')
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
  height: 28px;
  .item {
    height: 100%;
    cursor: pointer;
    padding-left: 15px;
    padding-right: 15px;
    display: flex;
    align-items: center;
    -webkit-app-region: no-drag;
  }
  .item :hover {
    background: red;
  }
}
</style>
