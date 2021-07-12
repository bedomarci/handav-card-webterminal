<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    :nudge-right="40"
    transition="scale-transition"
    offset-y
    min-width="auto"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        prepend-icon="mdi-calendar"
        readonly
        v-bind="attrs"
        v-on="on"
        :class="thisField.visible ? '' : 'd-none'"
        :label="thisField.label || property + ' label'"
        :placeholder="thisField.placeholder || ''"
        :hint="thisField.hint || ''"
        :type="thisField.type || 'text'"
        :disabled="disabled || false"
        v-bind:value="value"
        :rules="validation"
        clearable
        filled
      ></v-text-field>
    </template>
    <v-date-picker
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      @input="menu = false"
    ></v-date-picker>
  </v-menu>
</template>

<script>
import { EventBus } from '../plugins/event-bus.js'
import mixinConfig from '../mixins/mixinConfig'
import moment from 'moment'
import mixinField from '../mixins/mixinField.js'
export default {
  mixins: [mixinConfig, mixinField],
  props: {
    property: String,
    disabled: Boolean,
    value: [String, Number],
    visible: {
      type: Boolean,
      default: true,
    },
  },
  data: () => ({
    menu: false,
  }),
  created() {
    var defaultValue = null
    if (this.thisField.default !== null) {
      defaultValue = moment()
        .add(this.thisField.default, 'days')
        .format('YYYY-MM-DD')
    }
    EventBus.$on('reset-form', () => {
      this.$emit('input', defaultValue)
    })
    this.$emit('input', defaultValue)
  },
  methods: {},

  computed: {
    validation() {
      if (this.thisField.required) {
        var requiredRule = (value) =>
          !!value || this.$config.translation.message.requiredField
        return [requiredRule]
      }
      return []
      //
    },
  },
}
</script>