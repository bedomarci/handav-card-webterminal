<template>
  <v-app>
    <app-bar v-on:dialog="dialog = $event"></app-bar>
    <v-main>
      <v-container>
        <settings-modal v-model="dialog"></settings-modal>
        <v-overlay :value="formDisabled">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
        <v-form
          ref="form"
          v-model="valid"
          id="the-form"
          :disabled="formDisabled"
        >
          <v-row>
            <v-expand-transition>
              <v-col
                cols="12"
                v-show="!isCardUniqueIdentifierValid"
                class="shrink"
              >
                <v-alert dense type="info">
                  {{ __.message.pleaseReadCard }}
                </v-alert>
              </v-col>
            </v-expand-transition>

            <v-col lg="10" md="8" sm="6" class="shrink">
              <text-field
                v-model="createModel.CardUniqueIdentifier"
                property="CardUniqueIdentifier"
                :disabled="isCardUniqueIdentifierValid && config.disableUniqueIdentifierIfValid"
                v-on:blur="transformUniqueId"
              ></text-field>
            </v-col>

            <v-col lg="2" md="4" sm="6" class="align-center">
              <v-alert
                :icon="isCardUniqueIdentifierValid ? 'mdi-check' : 'mdi-close'"
                :type="isCardUniqueIdentifierValid ? 'success' : 'warning'"
              >
                {{
                  isCardUniqueIdentifierValid
                    ? __.common.valid
                    : __.common.invalid
                }}
              </v-alert>
            </v-col>

            <v-expand-transition>
              <v-col cols="12" v-show="isCardUniqueIdentifierValid">
                <dynamic-field
                  v-for="name in this.orderedFieldNamesWithoutUniqueId"
                  :key="name"
                  v-bind:value="getValueByName(name)"
                  v-on:input="setValueByName(name, $event)"
                  :property="name"
                ></dynamic-field>
              </v-col>
            </v-expand-transition>
          </v-row>
          <v-row>
            <v-col>
              <v-btn x-large color="warning" @click="resetForm">
                {{ __.message.resetForm }}
              </v-btn>
              <v-spacer></v-spacer>
            </v-col>
            <v-col class="text-right">
              <v-btn
                x-large
                color="success"
                class=""
                @click="submitForm"
                :disabled="formDisabled || !isCardUniqueIdentifierValid"
              >
                {{ __.common.submit }}
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
        <v-snackbar
          centered
          v-model="snackbar"
          :color="snackbarColor"
          :timeout="this.config.errorMessageTimeout"
        >
          <h3>{{ snackbarMessage }}</h3>
          <template v-slot:action="{ attrs }">
            <v-btn text v-bind="attrs" @click="snackbar = false">
              {{ __.common.close }}
            </v-btn>
          </template>
        </v-snackbar>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
// import Vue from 'vue'
import SettingsModal from './components/SettingsModal'

import DynamicField from './components/DynamicField'
import AppBar from './components/AppBar'
import mixinAPIMethods from './mixins/mixinAPIMethods'
import TextField from './components/TextField'
import mixinConfig from './mixins/mixinConfig'
import { EventBus } from './plugins/event-bus.js'
// import c from './app-constants'
// import axios from 'axios'

export default {
  name: 'App',
  mixins: [mixinAPIMethods, mixinConfig],
  components: {
    SettingsModal,
    TextField,
    DynamicField,
    AppBar,
  },

  created() {
    EventBus.$on('api-error', (message) => {
      console.log('api-error')
      this.snack(message, 'error')
      this.formDisabled = false
    })
    EventBus.$on('api-create-success', () => {
      this.snack(this.__.message.cardCreationWasSuccessful)
    })
    EventBus.$on('api-update-success', () => {
      this.snack(this.__.message.cardUpdateWasSuccessful)
    })
    EventBus.$on('api-group-success', (response) => {
      console.log(response)
      this.snack(this.__.message.cardGroupAssignmentWasSuccessful)
    })

    this.loadDefaultConfig()

    if (this.hasAPICredentials) {
      this.restoreAndFetchToken()
    }
    if (!this.hasAllProperties) {
      this.dialog = true
    } else {
      this.fetchRemoteConfig().then(this.resetForm)
      // .then(this.fetchToken)
      // .then(() => this.getGroups(133594416625080))
      // .then(async (response) => {
      //   var merged = await this.mergeGroupConfiguration(
      //     JSON.parse(JSON.stringify(this.config.groups)),
      //     response.data
      //   )
      //   console.log(merged)
      // })
    }
  },
  methods: {
    resetForm() {
      EventBus.$emit('reset-form')
      this.resetFormValidation()
    },
    submitForm() {
      this.validateForm()
      if (this.valid) {
        this.formDisabled = true
        //this.transformUniqueId()

        this.registerVirtualCard(this.model, this.config.groups).then(
          (response) => {
            this.resetForm()
            return response
          }
        )
      } else {
        this.$vuetify.goTo('#the-form')
      }
    },
    resetFormValidation() {
      this.$refs.form.resetValidation()
      this.formDisabled = false
      this.uniqueIDisTransformed = false
    },
    validateForm() {
      this.$refs.form.validate()
    },
    transformUniqueId() {
      //RUN ONLY ONCE

      if (this.uniqueIDisTransformed) return
      this.uniqueIDisTransformed = true


      if (this.config.convertHextoDecUniqueID) {
        var uniqueIdHex = parseInt(this.createModel.CardUniqueIdentifier, 16)
        if (this.config.filledUpFixedLength > uniqueIdHex.toString().length) {
          var zeros = '0'.repeat(this.config.filledUpFixedLength)
          uniqueIdHex = (zeros + uniqueIdHex).slice(this.config.filledUpFixedLength * -1)
        }
        this.createModel.CardUniqueIdentifier = uniqueIdHex
      } else if (this.config.convertDez10toDez35CUniqueID) {
        var uniqueIdDez10 = Number(
          this.createModel.CardUniqueIdentifier
        ).toString(16)
        uniqueIdDez10 = ('0000000' + uniqueIdDez10).slice(-6)
        var lowSide = uniqueIdDez10.substring(2)
        lowSide = ('00000' + parseInt(lowSide, 16)).slice(-5)
        var highSide = uniqueIdDez10.substring(0, 2)
        highSide = ('000' + parseInt(highSide, 16)).slice(-3)
        this.createModel.CardUniqueIdentifier = highSide + lowSide
      }

      this.createModel.CardUniqueIdentifier =
        this.config.UniqueIDPrefix +
        this.createModel.CardUniqueIdentifier +
        this.config.UniqueIDSuffix
    },
    snack(message, color = 'info') {
      this.snackbarMessage = message
      this.snackbarColor = color
      this.snackbar = true
    },
    getValueByName(name) {
      return this.model[this.config.fields[name].model][name]
    },
    setValueByName(name, val) {
      this.model[this.config.fields[name].model][name] = val
    },
  },
  watch: {
    isCardUniqueIdentifierValid(newVal, oldVal) {
      if (newVal && !oldVal) {
        this.createModel.CardUniqueIdentifier =
          this.createModel.CardUniqueIdentifier.replaceAll('ö', '0')
      }
    },
    'model.update.CardCreditAccumulateBit'(newVal) {
      if (newVal) this.updateModel.CardCreditSingleUseBit = false
    },
    'model.update.CardCreditSingleUseBit'(newVal) {
      if (newVal) this.updateModel.CardCreditAccumulateBit = false
    },
    'model.update.CardCreditTypeMoneyBit'(newVal) {
      this.$store.commit('hideField', {
        name: 'CreditAmountDailyLimit',
        hidden: newVal == 0,
      })
      this.$store.commit('hideField', {
        name: 'CreditAmountMonthlyLimit',
        hidden: newVal == 0,
      })
      this.$store.commit('hideField', {
        name: 'CreditAmountMonthlyReload',
        hidden: newVal == 0,
      })
      this.$store.commit('hideField', {
        name: 'CreditTransactionsDailyLimit',
        hidden: newVal == 1,
      })
      this.$store.commit('hideField', {
        name: 'CreditTransactionsMonthlyLimit',
        hidden: newVal == 1,
      })
      this.$store.commit('hideField', {
        name: 'CreditTransactionsMonthlyReload',
        hidden: newVal == 1,
      })
    },
  },
  computed: {
    hasAllProperties() {
      return (
        !!localStorage.username &&
        !!localStorage.password &&
        !!localStorage.configId
      )
    },
    hasAPICredentials() {
      return !!localStorage.username && !!localStorage.password
    },
    isCardUniqueIdentifierValid() {
      return (
        !!this.createModel.CardUniqueIdentifier &&
        this.createModel.CardUniqueIdentifier.length >=
          this.config.uniqueIdentifierLength
      )
    },
    isDetailFieldVisible() {
      return (
        !this.config.hideDetailFieldsBeforeUniqueIdentifierIsValid ||
        this.isCardUniqueIdentifierValid
      )
    },
    createModel() {
      return this.model.create
    },
    updateModel() {
      return this.model.update
    },
    orderedFieldNamesWithoutUniqueId() {
      return this.orderedFieldNames.filter(
        (item) => item !== 'CardUniqueIdentifier'
      )
    },
  },

  data: () => ({
    formDisabled: false,
    loader: false,
    dialog: false,
    snackbarMessage: '',
    snackbarColor: 'info',
    snackbar: false,
    model: {
      create: require('./assets/api-create-card-model.json'),
      update: require('./assets/api-update-prepaid-card.json'),
      misc: {},
    },
    valid: false,
    uniqueIDisTransformed: false,
  }),
}
</script>
