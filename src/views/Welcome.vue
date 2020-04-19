<template>
  <div class="main">
    <img draggable="false" src="../assets/welcome.png">
  </div>
</template>
<script>
const { ipcRenderer } = require('electron')
export default {
  name: 'Home',
  mounted () {
    ipcRenderer.send('show')
    this.jumpHome()
  },
  methods: {
    jumpHome () {
      setTimeout(() => {
        ipcRenderer.send('openMainWin')
      }, 3000)
    }
  }
}
</script>
<style lang="scss">
.main {
  margin: 0;
  padding: 0;
  overflow-y: hidden;
  border-radius: 4px;
}
</style>
