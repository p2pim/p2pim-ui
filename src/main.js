import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Vue from 'vue'
import App from './App.vue'
import store from './store'

new Vue({
  el: '#app',
  data: {},
  store,
  render: h => h(App)
})
