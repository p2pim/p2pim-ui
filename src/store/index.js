import Vue from "vue";
import Vuex from "vuex";
import Web3 from 'web3';
import detectEthereumProvider from '@metamask/detect-provider';
import P2pimMasterRecord from 'p2pim-ethereum-contracts/build/contracts/P2pimMasterRecord.json';
import P2pimAdjudicator from 'p2pim-ethereum-contracts/build/contracts/P2pimAdjudicator.json';
import IERC20 from '@openzeppelin/contracts/build/contracts/IERC20.json';
import BN from 'bn.js'


Vue.use(Vuex);

const Mutations = {
  AccountChanged: "accountsChanged",
  AllowanceLoaded: "allowanceLoaded",
  BalanceLoaded: "balanceLoaded",
  ChainSelected: "chainSelected",
  DeploymentsLoaded: "deploymentsLoaded",
  P2pimBalancesLoaded: "p2pimBalancesLoaded",
  ProviderDetected: "providerDetected",
}

const Actions = {
  DetectEthereum: "detectEthereum",
  LoadBalances: "loadBalances",
  UpdateAccount: "updateAccount",
  UpdateChainId: "updateChainId",
}

function mapKey(keys) {
  return keys.join('|');
}

function addItemLoaded(stateProperty, {chainId, account, token}, value) {
  if (!(mapKey([chainId, account]) in stateProperty)) {
    Vue.set(stateProperty, mapKey([chainId, account]), {})
  }
  const values = stateProperty[mapKey([chainId, account])];
  Vue.set(values, token, value);
}

export default new Vuex.Store({
  state: {
    provider: null,
    chainId: null,
    account: null,
    web3: null,
    deploymentsLoaded: {},
    balancesLoaded: {},
    p2pimBalancesLoaded: {},
    allowancesLoaded: {},
  },
  mutations: {
    [Mutations.AccountChanged] (state, account) {
      console.log('committing account', account);
      state.account = account;
    },
    [Mutations.BalanceLoaded] (state, {chainId, account, token, balance}) {
      console.log('commiting balance', chainId, account, token, balance);
      addItemLoaded(state.balancesLoaded, {chainId, account, token}, new BN(balance));
    },
    [Mutations.P2pimBalancesLoaded] (state, {chainId, account, token, balance}) {
      console.log('commiting p2pim balance', chainId, account, token, balance);
      addItemLoaded(state.p2pimBalancesLoaded, {chainId, account, token}, balance);
    },
    [Mutations.AllowanceLoaded] (state, {chainId, account, token, allowance}) {
      console.log('commiting allowance', chainId, account, token, allowance);
      addItemLoaded(state.allowancesLoaded, {chainId, account, token}, new BN(allowance));
    },
    [Mutations.ChainSelected] (state, chainId) {
      state.chainId = chainId;
    },
    [Mutations.DeploymentsLoaded] (state, {chainId, deployments}) {
      console.log('comitting deploymentsLoaded', chainId, deployments);
      Vue.set(state.deploymentsLoaded, chainId, deployments);
    },
    [Mutations.ProviderDetected] (state, provider) {
      state.provider = provider;
      state.web3 = new Web3(provider);
    },
  },
  getters: {
    deployments(state) {
      return state.deploymentsLoaded[state.chainId] ?? [];
    },
    balances(state) {
      const balances = state.balancesLoaded[mapKey([state.chainId, state.account])];
      return balances ?? {};
    },
    allowances(state) {
      const allowances = state.allowancesLoaded[mapKey([state.chainId, state.account])];
      return allowances ?? {};
    },
    p2pimBalances(state) {
      const p2pimBalances = state.p2pimBalancesLoaded[mapKey([state.chainId, state.account])];
      return p2pimBalances ?? {};
    }
  },
  actions: {
    async [Actions.DetectEthereum] ({commit, dispatch, state}) {
      console.debug('Detecting ethereum');
      if (state.provider) {
        console.log('TODO (log): provider already detected');
        throw 'TODO (error): provider already detected'
      }

      const provider = await detectEthereumProvider();
      commit(Mutations.ProviderDetected, provider);

      const processChainId = (chainId) => dispatch(Actions.UpdateChainId, chainId);
      provider.request({ method: 'eth_chainId' }).then(processChainId);
      provider.on('chainChanged', processChainId);

      const processAccounts = (accounts) => dispatch(Actions.UpdateAccount, accounts);
      provider.request({ method: 'eth_requestAccounts' }).then(processAccounts);
      provider.on('accountsChanged', processAccounts);
    },
    async [Actions.UpdateAccount] ({commit, dispatch, state}, accounts) {
      const account = accounts.length > 0 ? accounts[0] : null;
      if (state.account !== account) {
        commit(Mutations.AccountChanged, account);
        dispatch(Actions.LoadBalances);
      }
    },
    [Actions.LoadBalances] ({commit, state, getters}) {
      const chainId = state.chainId;
      const web3 = state.web3;
      const account = state.account;
      const deployments = getters.deployments;

      if (account && deployments) {

        for (const i in deployments) {
          const { token, adjudicator } = deployments[i];
          console.log('Checking balance and allowance for deployment ', token, adjudicator);
          // TODO: use clone that should be more efficient as it does not need to parse abi
          const tokenContract = new web3.eth.Contract(IERC20.abi, token);
          tokenContract.methods.balanceOf(account).call()
            .then(balance => commit(Mutations.BalanceLoaded, {chainId, account, token, balance}))
            .catch(err => console.error('TODO: Error: ', err));

          tokenContract.methods.allowance(account, adjudicator).call()
            .then(allowance => commit(Mutations.AllowanceLoaded, {chainId, account, token, allowance}))
            .catch(err => console.error('TODO: Error: ', err));

          // TODO: use clone that should be more efficient as it does not need to parse abi
          const adjudicatorContract = new web3.eth.Contract(P2pimAdjudicator.abi, adjudicator);
          adjudicatorContract.methods.balance(account).call()
            .then(balance => commit(Mutations.P2pimBalancesLoaded, {chainId, account, token, balance}))
            .catch(err => console.error('TODO: Error: ', err));
        }
      }
    },
    async [Actions.UpdateChainId] ({commit, dispatch, state}, chainId) {
      if (state.chainId !== chainId && state.web3 != null) {
        commit(Mutations.ChainSelected, chainId);
        const network = String(parseInt(state.chainId));
        console.debug('Finding deployments in the master record.', 'network:', network, 'chainId:', chainId);
        if (network in P2pimMasterRecord.networks) {
          const masterAddress = P2pimMasterRecord.networks[network].address;
          const masterAbi = P2pimMasterRecord.abi;
          const masterContract = new state.web3.eth.Contract(masterAbi, masterAddress);
          console.log('calling deployments method in master contract', masterAddress)
          try {
            const deployments = await masterContract.methods.deployments().call();
            console.log('deployments from master contract', deployments)
            commit(Mutations.DeploymentsLoaded, {chainId, deployments});
            dispatch(Actions.LoadBalances);
          } catch (e) {
            console.log('error calling deployments', e)
          }
        } else {
          console.warn('Chain salected does not have master record deployed');
        }
      }
    },
  }
})
