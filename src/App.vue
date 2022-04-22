<template>
  <div id="app">
    <page-header @ethereum-change="ethereum = $event" />
    <section class="container">
      <div v-if="ethAddress">
        <p2pim-balance />
        <deposit-form />
      </div>
      <p v-else>
        Please connect to your wallet
      </p>
    </section>
  </div>
</template>

<script>
import P2pimBalance from './components/P2pimBalance.vue';
import DepositForm from './components/DepositForm.vue';
import PageHeader from './components/PageHeader.vue';

export default {
  name: 'App',
  components: {
    PageHeader,
    P2pimBalance,
    DepositForm,
  },
  computed: {
    ethAddress: function() {
      console.log('Computing address');
      return this.$store.state.account;
    },
    web3: function() {
      console.log('Computing web3');
      return this.$store.state.web3;
    },
    deployments: function() {
      console.log('Computing deployments', this.$store.state.deployments);
      return this.$store.state.deployments;
    }
  },
  watch: {
    ethAddress(e) {
      console.log(e);
    }
  }
}
</script>

