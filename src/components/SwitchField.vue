<template>
  <v-switch
    :class="thisField.visible ? '' : 'd-none'"
    :label="thisField.label || property + ' label'"
    :placeholder="thisField.placeholder || property + ' placeholder'"
    :hint="thisField.hint || ''"
    :disabled="disabled || false"
    v-bind:input-value="value"
    v-on:change="$emit('input', !!$event)"
    clearable
    filled
  ></v-switch>
</template>

<script>
import { EventBus } from '../plugins/event-bus.js'
import mixinConfig from '../mixins/mixinConfig'
import mixinField from '../mixins/mixinField.js'
export default {
  mixins: [mixinConfig, mixinField],
  props: {
    property: String,
    disabled: Boolean,
    value: Boolean,
    visible: {
      type: Boolean,
      default: true
    }
  },
  data: () => ({}),

  created() {
    EventBus.$on('reset-form', () => {
      this.$emit('input', this.thisField.default)
    })
    this.$emit('input', this.thisField.default)
  },


}
</script>