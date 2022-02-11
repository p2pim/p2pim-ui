<template>
  <nav class="navbar navbar-default justify-content-between">
    <a
      class="navbar-brand"
      href="."
    ><div>P2pim</div></a>
    <wallet-connector @change="$emit('ethereum-address-change', $event)" />
  </nav>
</template>

<script>
import WalletConnector from './WalletConnector.vue'

export default {
  name: 'PageHeader',
  components: {
    WalletConnector
  }
}
</script>
