import Vue from 'vue'
import App from './App.vue'

new Vue({
  el: '#app',
  data: function () {
    return {
      message: 'Hello Vue!'
    }
  },
  render: h => h(App)
})
