export default {
  computed: {
    thisField() {
      return this.$store.getters.field(this.property)
    },
    isFieldVisible() {
      var hidden = this.thisField.hidden || false
      return this.thisField.visible && !hidden
    }
  }
}
