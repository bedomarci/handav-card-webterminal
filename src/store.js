import Vuex from 'vuex'
import Vue from 'vue'
import _ from 'lodash'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    token: null,
    tokenId: null,
    ExpirationUTC: null,
    config: {}
  },
  mutations: {
    setToken(state, token) {
      state.token = token
    },
    setTokenId(state, tokenId) {
      state.tokenId = tokenId
    },
    setExpiration(state, ExpirationUTC) {
      state.ExpirationUTC = ExpirationUTC
    },
    setConfig: (state, config) => {
      state.config = config;
    },
    mergeConfig: (state, config) => {
      state.config = _.defaultsDeep(config, state.config)
    },
    hideField: (state, payload) => {
      state.config.fields[payload.name].hidden = payload.hidden
    },
  },
  getters: {
    config: state => {
      return state.config
    },
    translation: state => {
      return state.config.translation
    },
    field: (state) => (fieldName) => {
      return state.config.fields[fieldName]
    },
    orderedFieldNames: state => {
      var map = _.map(state.config.fields, (value, key) => {
          return {
            "name": key,
            "order": value.order
          }
      });
      var orderedMap = _.orderBy(map, ['order']);
      return _.map(orderedMap, 'name');
    },
  },
})
