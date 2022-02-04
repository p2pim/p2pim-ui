<template>
  <div id="app">
    <page-header @ethereum-address-change="ethAddress = $event" />
    <div>
      <p>Here will come the content</p>
      <p v-if="ethAddress">
        Connected to the wallet, address {{ ethAddress }}
      </p>
    </div>
  </div>
</template>

<script>
import PageHeader from './components/PageHeader.vue'

export default {
  name: 'App',
  components: {
    PageHeader
  },
  data: function () {
    return {
      ethAddress: null
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
