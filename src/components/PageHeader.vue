<template>
  <nav class="navbar navbar-default justify-content-between">
    <a
      class="navbar-brand"
      href="."
    ><div>P2pim</div></a>
    <wallet-connector @change="test($event) /* $emit('ethereum-change', $event) */" />
  </nav>
</template>

<script>
import WalletConnector from './WalletConnector.vue'

export default {
  name: 'PageHeader',
  components: {
    WalletConnector
  },
  methods: {
    test(pepe) {
      console.log("testing", pepe);
      this.$emit('ethereum-change', pepe);
    }
  }
}
</script>
