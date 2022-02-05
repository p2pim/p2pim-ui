<template>
  <div class="wallet-connector">
    <button
      v-if="!address"
      type="button"
      class="btn btn-primary"
      @click="connectWallet"
    >
      Connect Wallet
    </button>
    <div v-if="address">
      {{ address }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'WalletConnector',
  data: function () {
    return {
      address: null
    }
  },
  methods: {
    connectWallet: async function () {
      if (!window.ethereum) {
        window.alert('There is no provider!')
      } else {
        const ethereum = window.ethereum
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
        console.log(accounts)
        if (accounts[0]) {
          this.address = accounts[0]
          this.$emit('change', this.address)
        }
      }
    }
  }
}
</script>
