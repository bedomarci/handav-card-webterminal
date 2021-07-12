<template>
  <div>
    <text-field
      v-if="isType('text') || isType('number')"
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      :property="property"
    ></text-field>
    <select-field
      v-if="isType('select')"
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      :property="property"
    ></select-field>
    <date-field
      v-if="isType('date')"
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      :property="property"
    ></date-field>
    <switch-field
      v-if="isType('bool')"
      v-bind:value="value"
      v-on:input="$emit('input', $event)"
      :property="property"
    ></switch-field>
  </div>
</template>

<script>
import TextField from './TextField'
import SelectField from './SelectField'
import SwitchField from './SwitchField'
import DateField from './DateField'
import mixinConfig from '../mixins/mixinConfig'
import mixinField from '../mixins/mixinField'
export default {
  mixins: [mixinConfig, mixinField],
  props: {
    property: String,
    disabled: Boolean,
    items: Array,
    value: [String, Number, Boolean],
    visible: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    TextField,
    SwitchField,
    SelectField,
    DateField,
  },
  methods: {
    isType(type) {
      return this.thisField.type == type
    },
  },
}
</script>