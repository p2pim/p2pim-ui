<template>
  <div id="app">
    <page-header @ethereum-address-change="ethAddress = $event" />
    <deposit-form v-if="ethAddress" v-bind:eth-address="ethAddress" v-bind:web3="web3" />
    <p v-else>Please connect to your wallet</p>
  </div>
</template>

<script>
import PageHeader from './components/PageHeader.vue';
import DepositForm from './components/DepositForm.vue';
import Web3 from 'web3';

export default {
  name: 'App',
  components: {
    PageHeader,
    DepositForm,
  },
  data: function () {
    return {
      ethAddress: null
    }
  },
  computed: {
    web3: function() {
      if (this.ethAddress) {
        return new Web3(window.ethereum);
      } else {
        return null;
      }
    }
  }
}
</script>

