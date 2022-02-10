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
      {{ shortAddress }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'WalletConnector',
  data: function () {
    return {
      address: null,
    }
  },
  watch: {
    address(newAddress) {
      this.$emit('change', newAddress);
    }
  },
  methods: {
    handleChainChanged: function (chainId) {
      console.log(chainId);
    },
    handleAccountsChanged: function (accounts) {
      if (accounts.length === 0) {
        this.address = null;
      } else {
        this.address = accounts[0];
      }
    },
    connectWallet: async function () {
      if (!window.ethereum) {
        window.alert('There is no provider!')
      } else {
        const ethereum = window.ethereum
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        await this.handleAccountsChanged(accounts);

        ethereum.on('chainChanged', this.handleChainChanged);
        ethereum.on('accountsChanged', this.handleAccountsChanged);

        const chainId = await ethereum.request({ method: 'eth_chainId'});
        this.handleChainChanged(chainId);
      }
    }
  },
  computed: {
    shortAddress: function () {
      return this.address.substring(0, 6) + '...' + this.address.substring(this.address.length - 4);
    },
  },
}
</script>
