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
    }
  },
  computed: {
    address: function () {
      console.log("Address", this.$store.state.account);
      return this.$store.state.account;
    },
    shortAddress: function () {
      return this.address.substring(0, 6) + '...' + this.address.substring(this.address.length - 4);
    },
  },
  methods: {
    connectWallet: async function () {
      this.buttonDisabled = true;
      this.spinner = true;
      try {
        // TODO: Import enum from other module
        await this.$store.dispatch('detectEthereum');
      } catch (error) {
        console.error("TODO", error);
      } finally {
        this.spinner = false;
        this.buttonDisabled = false;
      }
    }
  },
}
</script>
