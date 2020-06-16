<template>
  <div class="full_zobject_box">
    <zobject-keys :zobject="zobject" v-on:input="update_zobject"/>
    <label-desc-aliases :zobject="zobject" v-on:input="update_zobject"/>
    <other-keys :zobject="zobject" v-on:input="update_zobject"/>
  </div>
</template>

<script>

var ZobjectKeys = require('./ZobjectKeys.vue');
var LabelDescAliases = require('./LabelDescAliases.vue');

module.exports = {
  name: 'FullZobject',
  beforeCreate: function() { // Need to delay require of OtherKeys to avoid loop
    this.$options.components['other-keys'] = require('./OtherKeys.vue');
  },
  props: ['zobject'],
  data: function() {
    return {};
  },
  components: {
    'zobject-keys': ZobjectKeys,
    'label-desc-aliases': LabelDescAliases
  },
  methods: {
    update_zobject: function(new_zobject) {
      this.zobject = new_zobject;
      this.$emit('input', this.zobject);
    }
  }
}
</script>

<style lang="less">
.full_zobject_box {
  outline: 2px dashed #808080;
}
</style>
