<template>
  <div class="main">
    <img src="../assets/welcome.png">
  </div>
</template>
<script>
const { ipcRenderer } = require('electron')
export default {
  name: 'Home',
  mounted () {
    this.jumpHome()
    ipcRenderer.send('show')
  },
  methods: {
    jumpHome () {
      setTimeout(() => {
        this.$router.push({ path: '/Home' })
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
}
</style>
