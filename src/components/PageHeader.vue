<template>
  <div class="header">
    <a href="."><div>P2pim</div></a>
    <div>
      <wallet-connector @change="$emit('ethereum-address-change', $event)" />
    </div>
  </div>
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
