<template>
  <v-select
    :class="field.visible ? '' : 'd-none'"
    :label="field.label || property + ' label'"
    :placeholder="field.placeholder || property + ' placeholder'"
    :hint="field.hint || ''"
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
export default {
  mixins: [mixinConfig],
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
      this.$emit('input', this.field.default)
    })
    this.$emit('input', this.field.default)
  },

  methods: {
    updateModel(value) {
      if (this.field.type == 'number') value = parseInt(value)

      this.$emit('input', value)
    },
  },

  computed: {
    anyItems() {
      if (this.items) return this.items
      if (this.field.items) return this.field.items
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