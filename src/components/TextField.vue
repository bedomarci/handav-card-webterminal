<template>
  <v-text-field
    :class="field.visible ? '' : 'd-none'"
    :label="field.label || property + ' label'"
    :placeholder="field.placeholder || ''"
    :hint="field.hint || ''"
    :type="field.type || 'text'"
    :disabled="disabled || false"
    v-bind:value="value"
    v-on:input="updateModel($event)"
    :rules="validation"
    clearable
    filled
  ></v-text-field>
</template>

<script>
import { EventBus } from '../plugins/event-bus.js'
import mixinConfig from '../mixins/mixinConfig'
export default {
  mixins: [mixinConfig],
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
    validation() {
      if (this.field.required) {
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