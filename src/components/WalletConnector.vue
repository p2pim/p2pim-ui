<template>
  <div>
    <button
      v-if="!address"
      type="button"
      class="btn btn-primary"
      :disabled="buttonDisabled"
      @click="connectWallet"
    >
      <div
        v-if="spinner"
        class="spinner-border spinner-border-sm"
        role="status"
      >
        <span class="visually-hidden">Loading...</span>
      </div>
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
      buttonDisabled: false,
      spinner: false,
      address: null,
    }
  },
  computed: {
    shortAddress: function () {
      return this.address.substring(0, 6) + '...' + this.address.substring(this.address.length - 4);
    },
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
        this.buttonDisabled = true;
        this.spinner = true;
        try {
          const ethereum = window.ethereum
          const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
          await this.handleAccountsChanged(accounts);

          ethereum.on('chainChanged', this.handleChainChanged);
          ethereum.on('accountsChanged', this.handleAccountsChanged);

          const chainId = await ethereum.request({ method: 'eth_chainId'});
          this.handleChainChanged(chainId);
        } catch (error) {
          console.error(error);
        } finally {
          this.spinner = false;
          this.buttonDisabled = false;
        }
      }
    }
  },
}
</script>
