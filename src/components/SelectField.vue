<template>
  <v-select
    :class="thisField.visible ? '' : 'd-none'"
    :label="thisField.label || property + ' label'"
    :placeholder="thisField.placeholder || property + ' placeholder'"
    :hint="thisField.hint || ''"
    :items="anyItems"
    :disabled="disabled || false"
    item-text="label"
    item-value="value"
    v-bind:value="value"
    v-on:input="$emit('input', $event)"
    filled
  ></v-select>
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
    items: Array,
    value: Number,
    visible: {
      type: Boolean,
      default: true,
    },
  },
  data: () => ({}),

  created() {
    EventBus.$on('reset-form', () => {
      this.$emit('input', this.thisField.default)
    })
    this.$emit('input', this.thisField.default)
  },

  methods: {
  },

  computed: {
    anyItems() {
      if (this.items) return this.items
      if (this.thisField.items) return this.thisField.items
      return []
    },
    rules() {
      const rules = []
      rules['required'] = (value) =>
        !!value || this.$config.translation.message.requiredField
      return rules
    },
  },
}
</script>