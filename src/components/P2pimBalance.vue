<template>
  <div class="panel panel-default">
    <div class="panel-header">
      <h4>Balance</h4>
    </div>
    <div class="panel-body">
      <ul class="list-group">
        <il
          v-for="(balance, token) in p2pimBalances"
          :key="token"
        >
          {{ token }}: {{ balance.available }}
        </il>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'P2pimBalance',
  computed: {
    p2pimBalances: function () {
      return this.$store.getters.p2pimBalances;
    }
  },
}
</script>
