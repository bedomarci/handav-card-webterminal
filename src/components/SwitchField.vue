<template>
  <v-switch
    :class="field.visible ? '' : 'd-none'"
    :label="field.label || property + ' label'"
    :placeholder="field.placeholder || property + ' placeholder'"
    :hint="field.hint || ''"
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
export default {
  mixins: [mixinConfig],
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
      this.$emit('input', this.field.default)
    })
    if (this.field.default) console.log(this)
    this.$emit('input', this.field.default)
  },


}
</script>