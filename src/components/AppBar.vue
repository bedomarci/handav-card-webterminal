<template>
  <v-app-bar
    app
    :color="config.header.bgColor"
    dark
    flat
    :src="config.header.bgImage"
  >
    <template v-slot:img="{ props }">
      <v-img v-bind="props" :gradient="config.header.gradient"></v-img>
    </template>

    <v-img
      class="mx-2"
      :src="config.header.icon"
      :max-height="config.header.iconSize"
      :max-width="config.header.iconSize"
      contain
      v-show="config.header.icon"
    ></v-img>

    <v-toolbar-title>{{ config.header.title }}</v-toolbar-title>

    <v-spacer></v-spacer>

    <v-btn
      icon
      @click="$emit('dialog', true)"
      :class="config.hideSettingsIcon ? 'd-none' : ''"
    >
      <v-icon dark>mdi-cog</v-icon>
    </v-btn>
  </v-app-bar>
</template>
<script>
import mixinConfig from '../mixins/mixinConfig'
export default {
  mixins: [mixinConfig],
}
</script>