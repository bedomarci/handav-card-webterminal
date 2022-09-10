<template>
  <v-text-field
    :class="isFieldVisible ? '' : 'd-none'"
    :label="thisField.label || property + ' label'"
    :placeholder="thisField.placeholder || ''"
    :hint="thisField.hint || ''"
    :type="thisField.type || 'text'"
    :disabled="disabled || false"
    v-bind:value="value"
    v-on:input="updateModel($event)"
    v-on:blur="$emit('blur')"
    :rules="validation"
    clearable
    filled
  ></v-text-field>
</template>

<script>
import { EventBus } from '../plugins/event-bus.js'
import mixinConfig from '../mixins/mixinConfig'
import mixinField from '../mixins/mixinField'
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
  data: () => ({}),
  created() {
    EventBus.$on('reset-form', () => {
      this.$emit('input', this.thisField.default)
    })
    this.$emit('input', this.thisField.default)
  },
  methods: {
    updateModel(value) {
      if (this.thisField.type == 'number') value = parseInt(value)

      this.$emit('input', value)
    },
  },

  computed: {
    validation() {
      if (this.thisField.required) {
        var requiredRule = (value) =>
        !!value || this.__.message.requiredField
        return [requiredRule]
      }
      return []
      // const rules = []
      // rules['required'] = 
      // return rules
      //     

    },
  },
}
</script>