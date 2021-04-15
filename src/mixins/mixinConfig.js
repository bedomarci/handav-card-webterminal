
import axios from 'axios'
import c from '../app-constants'
import { EventBus } from '../plugins/event-bus.js'

export default {
  // data() {
  //   return {
  //     config: {}
  //   }
  // },
  computed: {
    config() {
        return this.$store.getters.config
    },
    field() {
        return this.$store.getters.field(this.property)
    },
    __() {
        return this.$store.getters.translation
    },
  },

  methods: {
    loadDefaultConfig() {
      var defaultConfig = require('../assets/default-config.json')
      defaultConfig.fields.CountryID.items = require('../assets/countries.json')
      this.$store.commit('setConfig', defaultConfig)
    },
    fetchRemoteConfig() {
      return axios
        .get(c.API_FETCH_CONFIG_URL + localStorage.configId + '.json')
        .then(
          function(response) {
            this.$store.commit('mergeConfig', response.data)
          }.bind(this)
        )
        .then(
          function() {
            this.$vuetify.theme.themes.light = this.config.theme
          }.bind(this)
        )
        .catch(error => EventBus.$emit('api-error', error.message))
    }
  }
}
