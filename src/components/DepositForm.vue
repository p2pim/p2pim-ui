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
          :disabled="submitDisabled"
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
import P2pimMasterRecord from 'p2pim-ethereum-contracts/build/contracts/P2pimMasterRecord.json';
import BN from 'bn.js'

const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

function contractAddress(contract, chainId) {
  return contract.networks[chainId].address
}

export default {
  name: 'DepositForm',
  props: {
    ethAddress: {
      type: String,
      required: true,
    },
    web3: {
      type: Object,
      required: true,
    },
  },
  data: function () {
    return {
      inputAmount: null,
      inputToken: null,
      balance: null,
      allowance: null,
      chainId: null,
      deployments: null,
    }
  },
  computed: {
    submitDisabled: function () {
      return !(this.amount &&
        this.balance &&
        this.allowance &&
        this.amount.cmp(this.balance) <= 0 &&
        this.amount.cmp(this.allowance) <= 0 &&
        this.amount.cmp(new BN(0)) > 0
      );
    },
    p2pimMasterRecordContract: function () {
      if (this.chainId) {
        const address = contractAddress(P2pimMasterRecord, this.chainId);
        return new this.web3.eth.Contract(P2pimMasterRecord.abi, address);
      }
      return null;
    },
    p2pimAdjudicatorContract: function () {
      if (this.chainId && this.inputToken && this.deployments) {
        const deployment = this.deployments.find(deployment => deployment.token === this.inputToken);
        if (deployment) {
          return new this.web3.eth.Contract(P2pimAdjudicator.abi, deployment.adjudicator);
        } else {
          console.log("This could not happen");
        }
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
    },
    tokenContract: function() {
      if (this.inputToken && this.chainId && this.deployments) {
        return new this.web3.eth.Contract(IERC20.abi, this.inputToken);
      }
      return null;
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
    p2pimMasterRecordContract: function (contract) {
      if (contract) {
        contract.methods.deployments().call()
          .then(deployments => {
            this.deployments = deployments;
          });
      }
    },
    // should we use computed async https://www.npmjs.com/package/vue-async-computed?
    tokenContract(tokenContract) {
      this.refreshChainData(tokenContract, this.p2pimAdjudicatorContract, this.chainId);
    },
    p2pimAdjudicatorContract(p2pimAdjudicatorContract) {
      this.refreshChainData(this.tokenContract, p2pimAdjudicatorContract, this.chainId);
    },
    chainId(chainId) {
      this.refreshChainData(this.tokenContract, this.p2pimAdjudicatorContract, chainId);
    },
  },
  methods: {
    deposit: function () {
      this.p2pimAdjudicatorContract.methods
        .deposit(this.amount, this.ethAddress)
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
        .approve(this.p2pimAdjudicatorContract.options.address, MAX_UINT256)
        .send({from: this.ethAddress})
        .on('sending', arg => console.log('sending', arg))
        .on('sent', arg => console.log('sent', arg))
        .on('transactionHash', arg => console.log('transactionHash', arg))
        .on('receipt', arg => console.log('receipt', arg))
        .on('confirmation', arg => console.log('confirmation', arg))
        .on('error', arg => console.log('error', arg))
        .then(() => this.refreshChainData(this.tokenContract, this.chainId));
    },
    refreshChainData: function(tokenContract, p2pimAdjudicatorContract, chainId) {
      if (tokenContract && p2pimAdjudicatorContract && chainId) {
        tokenContract.methods.balanceOf(this.ethAddress).call()
          .then(balance => {
            if (this.tokenContract === tokenContract && this.chainId === chainId) {
              this.balance = new BN(balance);
            }
          })
          .catch((err) => console.log('TODO: Error %s', err));
        tokenContract.methods.allowance(this.ethAddress, p2pimAdjudicatorContract.options.address).call()
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
  }

}
</script>
