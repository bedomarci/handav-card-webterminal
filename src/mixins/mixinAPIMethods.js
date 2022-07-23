import axios from 'axios'
import c from '../app-constants'
import { EventBus } from '../plugins/event-bus.js'
import _ from 'lodash'

export default {
  computed: {
    token() {
      return this.$store.state.token
    },
    tokenId() {
      return this.$store.state.tokenId
    },
    expiration() {
      return this.$store.state.ExpirationUTC
    },
    postHeader() {
      return {
        headers: {
          Authorization: 'Bearer ' + this.token
        }
      }
    }
  },

  methods: {
    registerVirtualCard(model, groups) {
      var cardCreateResponse = null
      return this.fetchToken()
        .then(() => this.createCard(model))
        .then(response => {
          cardCreateResponse = response
          EventBus.$emit('api-create-success', response)
        })
        .then(() =>
          this.updateCard(cardCreateResponse.data.CardID, model.update)
        )
        .then(response => {
          EventBus.$emit('api-update-success', response)
        })
        .then(() => this.getGroups(cardCreateResponse.data.CardID))
        .then(async response => {
          var mergedGroups = await this.mergeGroupConfiguration(
            JSON.parse(JSON.stringify(groups)),
            response.data
          )
          return this.updateGroups(cardCreateResponse.data.CardID, mergedGroups)
        })
        .then(response => {
          if (response) EventBus.$emit('api-group-success', response)
        })
        .then(() => {
          if (model.misc.credit) {
            this.postCredit(
              cardCreateResponse.data.CardUniqueIdentifier,
              model.misc.credit
            )
          }
        })
        .then(() => {
          if (model.misc.revalue) {
            this.postRevalue(
              cardCreateResponse.data.CardUniqueIdentifier,
              model.misc.revalue
            )
          }
        })
        .catch(this.apiError)
    },
    createCard(model) {
      //delay(1000);
      return axios.post(
        c.API_CARD_CREATE_URL,
        { ...model.create },
        this.postHeader
      )
    },
    updateCard(cardID, updateModel) {
      //delay(1000);
      return axios.put(
        c.API_CARD_UPDATE_URL.replace('{CardId}', cardID),
        { ...updateModel },
        this.postHeader
      )
    },
    getGroups(cardID) {
      return axios.get(
        c.API_CARD_GROUPS_URL.replace('{CardId}', cardID),
        this.postHeader
      )
    },
    updateGroups(cardID, updateGroups) {
      //delay(1000);
      return axios.put(
        c.API_CARD_GROUPS_URL.replace('{CardId}', cardID),
        updateGroups,
        this.postHeader
      )
    },
    postCredit(cardUniqueId, credit) {
      return axios.post(
        c.API_CARD_CREDIT_URL.replace(
          '{CardUniqueIdentifier}',
          cardUniqueId
        ).replace('{value}', credit),
        {},
        this.postHeader
      )
    },
    postRevalue(cardUniqueId, revalue) {
      return axios.post(
        c.API_CARD_REVALUE_URL.replace(
          '{CardUniqueIdentifier}',
          cardUniqueId
        ).replace('{value}', revalue),
        {},
        this.postHeader
      )
    },
    fetchToken() {
      return axios
        .post(c.API_TOKEN_AUTH_URL, {
          Usr: localStorage.username,
          Pwd: localStorage.password,
          TokenId: this.tokenId
        })
        .then(response => {
          console.log(response.data.Token)
          this.$store.commit('setToken', response.data.Token)
          this.$store.commit('setTokenId', response.data.TokenId)
          this.$store.commit('setExpiration', response.data.ExpirationUTC)
          localStorage.tokenId = response.data.TokenId
          localStorage.expiration = response.data.ExpirationUTC
          EventBus.$emit('api-fetch-success')
          return response
        }, this.apiError)
    },
    apiError(error) {
      var msg = error
      console.log(error.response)
      if (error.response) msg = 'API: ' + error.response.data.message
      else if (error.message) msg = error.message
      EventBus.$emit('api-error', msg)
      return error
    },
    forgetToken() {
      this.$store.commit('setToken', null)
      this.$store.commit('setTokenId', null)
      this.$store.commit('setExpiration', null)
      localStorage.removeItem('tokenId')
      localStorage.removeItem('expiration')
    },
    deleteToken() {
      axios.delete(c.API_TOKEN_URL, this.postHeader).then(
        response => {
          console.log(response)
          this.forgetToken()
        },
        error => {
          console.log(error.response.data)
          EventBus.$emit('api-error', error.response)
        }
      )
    },
    loadTokenFromLocalStorage() {
      if (localStorage.tokenId) {
        this.$store.commit('setTokenId', localStorage.tokenId)
        this.$store.commit('setExpiration', localStorage.expiration)
      }
    },
    restoreAndFetchToken() {
      if (!this.$store.state.tokenId && this.isStoredTokenValid()) {
        this.loadTokenFromLocalStorage()
      } else {
        console.log('Missing or invalid token. Fetching a new one.')
      }
      this.fetchToken()
    },
    isStoredTokenValid() {
      if (!localStorage.expiration) return false
      var expirationDate = Date.parse(localStorage.expiration)
      var currentDate = Date.now()
      return expirationDate > currentDate
    },
    async mergeGroupConfiguration(newValue, originalValue) {
      newValue = _.chain(newValue).keyBy('CardGroupId')
      originalValue = _.chain(originalValue).keyBy('CardGroupId')
      var merged = await _.defaultsDeep(newValue.value(), originalValue.value())
      console.log(merged)
      return await _.values(merged)
    }
  }
}
