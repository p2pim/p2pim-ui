<template>
  <div class="panel panel-default">
    <div class="panel-header">
      <h4>Deposit</h4>
    </div>
    <div class="panel-body">
      <form>
        <div>
          <label for="token">Token</label>
          <select
            id="token"
            v-model="inputToken"
            class="form-select"
          >
            <option
              v-for="deployment in deployments"
              :key="deployment.token"
              :value="deployment.token"
            >
              {{ deployment.token }}
            </option>
          </select>
        </div>
        <div>
          <label for="amount">Amount</label>
          <input
            id="amount"
            v-model="inputAmount"
            class="form-control"
            type="number"
            placeholder="0.0"
          >
        </div>
        <div>
          <button
            v-if="needsAllowance"
            type="button"
            class="btn btn-primary"
            @click="approveAllowance"
          >
            Allow P2pim to use your tokens
          </button>
        </div>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="isDepositDisabled"
          @click="deposit"
        >
          Deposit
        </button>
      </form>
      <div>Balance: {{ balance }}</div>
    </div>
  </div>
</template>

<script>
import IERC20 from '@openzeppelin/contracts/build/contracts/IERC20.json';
import P2pimAdjudicator from 'p2pim-ethereum-contracts/build/contracts/P2pimAdjudicator.json';
import BN from 'bn.js'
// import {mapGetters} from 'vuex';


const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

export default {
  name: 'DepositForm',
  data: function () {
    return {
      inputAmount: null,
      inputToken: null,
    }
  },
  computed: {
    web3: function () {
      return this.$store.state.web3;
    },
    account: function () {
      return this.$store.state.account;
    },
    deployments: function () {
      console.log('computing deployments', this.$store.getters.deployments);
      return this.$store.getters.deployments;
    },
    adjudicatorAddress: function () {
      return this.deployments.find(deployment => deployment.token === this.inputToken).adjudicator;
    },
    chainId: function () {
      return this.$store.state.chainId;
    },
    balance: function () {
      return this.$store.getters.balances[this.inputToken];
    },
    allowance: function () {
      return this.$store.getters.allowances[this.inputToken];
    },
    isDepositDisabled: function () {
      return !(this.amount &&
        this.balance &&
        this.allowance &&
        this.amount.cmp(this.balance) <= 0 &&
        this.amount.cmp(this.allowance) <= 0 &&
        this.amount.cmp(new BN(0)) > 0
      );
    },
    amount: function () {
      return new BN(this.inputAmount);
    },
    needsAllowance: function () {
      return this.allowance &&
        this.balance &&
        this.amount &&
        this.amount.cmp(this.balance) <= 0 &&
        this.allowance.cmp(this.amount) < 0
    },
  },
  methods: {
    deposit: function () {
      const contract = new this.web3.eth.Contract(P2pimAdjudicator.abi, this.adjudicatorAddress);
      contract.methods
        .deposit(this.amount, this.account)
        .send({from: this.account})
        .on('sending', arg => console.log('sending', arg))
        .on('sent', arg => console.log('sent', arg))
        .on('transactionHash', arg => console.log('transactionHash', arg))
        .on('receipt', arg => console.log('receipt', arg))
        .on('confirmation', arg => console.log('confirmation', arg))
        .on('error', arg => console.log('error', arg))
        .then(() => console.log('TODO: deposit done: should refresh automatically the data'));
    },
    approveAllowance: function () {
      const contract = new this.web3.eth.Contract(IERC20.abi, this.inputToken);
      contract.methods
        .approve(this.p2pimAdjudicatorContract.options.address, MAX_UINT256)
        .send({from: this.account})
        .on('sending', arg => console.log('sending', arg))
        .on('sent', arg => console.log('sent', arg))
        .on('transactionHash', arg => console.log('transactionHash', arg))
        .on('receipt', arg => console.log('receipt', arg))
        .on('confirmation', arg => console.log('confirmation', arg))
        .on('error', arg => console.log('error', arg))
        .then(() =>  console.log('TODO: allowance done: should refresh automatically the data'));
    },
  },
}
</script>
