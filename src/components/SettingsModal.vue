<template>
  <v-dialog
    transition="dialog-bottom-transition"
    max-width="800"
    persistent
    v-model="value"
  >
    <v-card>
      <v-toolbar color="primary headline" dark>{{
        __.settings.header
      }}</v-toolbar>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                :label="__.settings.labelUsername"
                :placeholder="__.settings.placeholderUsername"
                required
                clearable
                :rules="[rules.required]"
                v-model="username"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                :label="__.settings.labelPassword"
                :placeholder="__.settings.placeholderPassword"
                required
                clearable
                type="password"
                :rules="[rules.required]"
                v-model="password"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                :label="__.settings.labelConfig"
                :placeholder="__.settings.placeholderConfig"
                required
                clearable
                :rules="[rules.required]"
                v-model="configId"
              ></v-text-field>
            </v-col>

            <v-snackbar
              color="error"
              v-model="isAlertVisible"
              :timeout="this.config.errorMessageTimeout"
            >
              {{ error }}
              <template v-slot:action="{ attrs }">
                <v-btn text v-bind="attrs" @click="isAlertVisible = false">
                  {{ __.common.close }}
                </v-btn>
              </template>
            </v-snackbar>
          </v-row>
          <v-row
            :class="this.config.enableTokenControl ? '' : 'd-none'"
            align="center"
            justify="space-around"
          >
            <v-col cols="12">
              <v-btn
                class="ma-2"
                small
                color="success"
                @click="fetchToken"
                :disabled="!username || !password"
                >Fetch token</v-btn
              >
              <v-btn
                class="ma-2"
                small
                color="warning"
                @click="forgetToken"
                :disabled="!token"
                >Forget token
              </v-btn>
              <v-btn
                class="ma-2"
                small
                color="error"
                @click="deleteToken"
                :disabled="!token"
                >Delete token
              </v-btn>
            </v-col>
            <v-col cols="12">
              Token: {{ token }} <br />
              TokenID: {{ tokenId }} <br />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn text @click="save" :disabled="!savable">{{
          __.common.save
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import mixinAPIMethods from '../mixins/mixinAPIMethods'
import mixinConfig from '../mixins/mixinConfig'

export default {
  name: 'SettingsModal',
  props: ['value'],
  mixins: [mixinAPIMethods, mixinConfig],
  data: () => ({
    username: '',
    password: '',
    configId: '',
    error: '',
    isAlertVisible: false,
    configHasChanged: false,
  }),
  created() {},
  methods: {
    save() {
      this.$emit('input', false)
      if (!this.token) {
        this.restoreAndFetchToken()
      }
      if (this.configHasChanged) {
        this.configHasChanged = false
        location.reload()
      }
    },
  },
  computed: {
    rules() {
      const rules = []
      rules['required'] = (value) =>
        !!value || this.config.translation.message.requiredField
      return rules
    },
    savable() {
      return this.username && this.password && this.configId
    },
  },
  mounted() {
    if (localStorage.username) {
      this.username = localStorage.username
    }
    if (localStorage.password) {
      this.password = localStorage.password
    }
    if (localStorage.configId) {
      this.configId = localStorage.configId
    }
  },
  watch: {
    username: (value) => {
      if (value) localStorage.username = value
      else localStorage.removeItem('username')
    },
    password: (value) => {
      if (value) localStorage.password = value
      else localStorage.removeItem('password')
    },
    configId(value, oldValue) {
      if (oldValue != value && oldValue) this.configHasChanged = true
      if (value) localStorage.configId = value
      else localStorage.removeItem('configId')
    },
  },
}
</script>