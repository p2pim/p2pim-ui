<template>
  <div>
    <h4>Deposit</h4>
    <form>
      <div>
        <label for="token">Token</label>
        <input id="token" class="form-control" type="text" placeholder="Token" v-model="inputToken"/>

      </div>
      <div>
        <label for="amount">Amount</label>
        <input id="amount" class="form-control" type="number" placeholder="0.0" v-model="inputAmount"/>
      </div>
      <div>
        <button
          v-if="needsAllowance"
          v-on:click="approveAllowance"
          type="button"
          class="btn btn-primary"
        >
        Allow P2pim to use your tokens
        </button>
      </div>
      <button v-on:click="deposit" type="button" class="btn btn-primary" v-bind:disabled="submitDisabled">Deposit</button>
    </form>
    <div>Balance: {{ balance }}</div>
  </div>
</template>

<script>
import IERC20 from '@openzeppelin/contracts/build/contracts/IERC20.json';
import P2pimAdjudicator from 'p2pim-ethereum-contracts/build/contracts/P2pimAdjudicator.json';
import BN from 'bn.js'

const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

function contractAddress(contract, chainId) {
  return contract.networks[chainId].address
}

export default {
  name: 'DepositForm',
  props: ['ethAddress', 'web3'],
  data: function () {
    return {
      inputAmount: null,
      inputToken: null,
      balance: null,
      allowance: null,
      chainId: null,
    }
  },
  methods: {
    deposit: function () {
      this.p2pimAdjudicatorContract.methods
        .deposit(this.tokenContract.options.address, this.amount, this.ethAddress)
        .send({from: this.ethAddress})
        .on('sending', arg => console.log('sending', arg))
        .on('sent', arg => console.log('sent', arg))
        .on('transactionHash', arg => console.log('transactionHash', arg))
        .on('receipt', arg => console.log('receipt', arg))
        .on('confirmation', arg => console.log('confirmation', arg))
        .on('error', arg => console.log('error', arg))
        .then(() => this.refreshChainData(this.tokenContract, this.chainId));
    },
    approveAllowance: function () {
      this.tokenContract.methods
        .approve(contractAddress(P2pimAdjudicator, this.chainId), MAX_UINT256)
        .send({from: this.ethAddress})
        .on('sending', arg => console.log('sending', arg))
        .on('sent', arg => console.log('sent', arg))
        .on('transactionHash', arg => console.log('transactionHash', arg))
        .on('receipt', arg => console.log('receipt', arg))
        .on('confirmation', arg => console.log('confirmation', arg))
        .on('error', arg => console.log('error', arg))
        .then(() => this.refreshChainData(this.tokenContract, this.chainId));
    },
    refreshChainData: function(tokenContract, chainId) {
      if (tokenContract && chainId) {
        tokenContract.methods.balanceOf(this.ethAddress).call()
          .then(balance => {
            if (this.tokenContract === tokenContract && this.chainId === chainId) {
              this.balance = new BN(balance);
            }
          })
          .catch((err) => console.log('TODO: Error %s', err));
        tokenContract.methods.allowance(this.ethAddress, contractAddress(P2pimAdjudicator, this.chainId)).call()
          .then(allowance => {
            if (this.tokenContract === tokenContract && this.chainId === chainId) {
              this.allowance = new BN(allowance);
            }
          })
          .catch(err => console.log('TODO: Error: ', err));
      } else {
        this.balance = null;
        this.allowance = null;
      }
    }
  },
  watch: {
    web3: {
      handler: function(web3) {
        web3.eth.getChainId()
          .then(chainId => this.chainId = chainId)
          .catch(err => console.log("TODO: Error: ", err));
      },
      immediate: true,
    },
    // should we use computed async https://www.npmjs.com/package/vue-async-computed?
    tokenContract(tokenContract) {
      this.refreshChainData(tokenContract, this.chainId);
    },
    chainId(chainId) {
      this.refreshChainData(this.tokenContract, chainId);
    },
  },
  computed: {
    submitDisabled: function () {
      console.log("submitDisabled", this.amount, this.balance, this.allowance);
      if (this.amount && this.balance && this.allowance) {
        console.log("next", this.amount.cmp(this.balance), this.amount.cmp(this.allowance));
        console.log("Other", )
      }
      return !(this.amount &&
        this.balance &&
        this.allowance &&
        this.amount.cmp(this.balance) <= 0 &&
        this.amount.cmp(this.allowance) <= 0 &&
        this.amount.cmp(new BN(0)) > 0
      );
    },
    tokenContract: function () {
      if (this.inputToken) {
        try {
          return new this.web3.eth.Contract(IERC20.abi, this.inputToken);
        } catch (error) {
          console.log(error);
        }
      }
      return null;
    },
    p2pimAdjudicatorContract: function () {
      if (this.chainId) {
        const address = contractAddress(P2pimAdjudicator, this.chainId);
        return new this.web3.eth.Contract(P2pimAdjudicator.abi, address);
      }
      return null;
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
    }
  }

}
</script>
