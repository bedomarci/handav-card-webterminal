import axios from 'axios'
import c from '../app-constants'
import { EventBus } from '../plugins/event-bus.js'

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
    postCard(model) {
      var cardCreateResponse = null
      // var cardUpdateResponse
      return this.fetchToken()
        .then(() => {
          return axios.post(
            c.API_CARD_CREATE_URL,
            { ...model.create },
            this.postHeader
          )
        })
        .then(response => {
          cardCreateResponse = response
          EventBus.$emit('api-create-success', response)
          return this.fetchToken()
        }, this.apiError)
        // .then(() => {
        //   return this.fetchToken()
        // }, this.apiError)
        .then(() => {
          return this.updateCard(cardCreateResponse.data.CardID, model.update)
        }, this.apiError)
        .then(response => {
          // cardUpdateResponse = response
          console.log(response)
          EventBus.$emit('api-update-success', response)
          return this.fetchToken()
        }, this.apiError)
        // .then(() => {
        //   return this.fetchToken()
        // }, this.apiError)
        // .then(() => {
        //   if (model.misc.Credit && cardCreateResponse)
        //     return this.postCredit(
        //       cardCreateResponse.data.CardUniqueIdentifier,
        //       model.misc.Credit
        //     )
        // }, this.apiError)
        // .then(() => {
        //   return this.fetchToken()
        // }, this.apiError)
        // .then(() => {
        //   if (model.misc.Revalue && cardCreateResponse)
        //     this.postRevalue(
        //       cardCreateResponse.data.CardUniqueIdentifier,
        //       model.misc.Revalue
        //     )
        // }, this.apiError)
    },
    updateCard(cardID, updateModel) {
      return axios.put(
        c.API_CARD_UPDATE_URL.replace('{CardId}', cardID),
        { ...updateModel },
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
      EventBus.$emit('api-error', 'API: ' + error.response.data.message)
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
    }
  }
}
