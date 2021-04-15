<template>
  <v-app>
    <app-bar v-on:dialog="dialog = $event"></app-bar>
    <v-main>
      <v-container>
        <settings-modal v-model="dialog"></settings-modal>
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
                :disabled="
                  isCardUniqueIdentifierValid && isCardUniqueIdentifierValid
                "
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
                <div v-for="(field, name) in this.config.fields" :key="name">
                  <div v-if="name != 'CardUniqueIdentifier'">
                    <text-field
                      v-if="field.type == 'text' || field.type == 'number'"
                      v-model="model[field.model][name]"
                      :property="name"
                    ></text-field>
                    <select-field
                      v-if="field.type == 'select'"
                      v-model="model[field.model][name]"
                      :property="name"
                    ></select-field>
                    <date-field
                      v-if="field.type == 'date'"
                      v-model="model[field.model][name]"
                      :property="name"
                    ></date-field>
                    <switch-field
                      v-if="field.type == 'bool'"
                      v-model="model[field.model][name]"
                      :property="name"
                    ></switch-field>
                  </div>
                </div>
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
          v-model="snackbar"
          :color="snackbarColor"
          :timeout="this.config.errorMessageTimeout"
        >
          {{ snackbarMessage }}
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
import TextField from './components/TextField'
import SelectField from './components/SelectField'
import SwitchField from './components/SwitchField'
import DateField from './components/DateField'
import AppBar from './components/AppBar'
import mixinAPIMethods from './mixins/mixinAPIMethods'
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
    SwitchField,
    SelectField,
    DateField,
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
    this.loadDefaultConfig()

    if (this.hasAPICredentials) {
      this.restoreAndFetchToken()
    }
    if (!this.hasAllProperties) {
      this.dialog = true
    } else {
      this.fetchRemoteConfig().then(this.resetForm)
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
        this.transformUniqueId()
        this.postCard(this.model).then((response) => {
          this.resetForm()
          return response
        })
      } else {
        this.$vuetify.goTo('#the-form')
      }
    },
    resetFormValidation() {
      this.$refs.form.resetValidation()
      this.formDisabled = false
    },
    validateForm() {
      this.$refs.form.validate()
    },
    transformUniqueId() {
      if (this.config.convertHextoDecUniqueID) {
        var uniqueIdHex = parseInt(this.createModel.CardUniqueIdentifier, 16)
        this.createModel.CardUniqueIdentifier = uniqueIdHex
      }
    },
    snack(message, color = 'info') {
      this.snackbarMessage = message
      this.snackbarColor = color
      this.snackbar = true
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
  },

  data: () => ({
    formDisabled: false,
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
  }),
}
</script>
