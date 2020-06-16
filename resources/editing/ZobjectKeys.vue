<template>
  <div>
      <span>{{ z1k1label }} (Z1K1): </span>
    <select v-model="type">
       <option v-for="ztype in ztypes" v-bind:value="ztype.value">
         {{ ztype.label }} ({{ ztype.value }})
       </option>
    </select>
  </div>
</template>

<script>
module.exports = {
  name: 'ZobjectKeys',
  computed: {
    type: {
      get: function() {
        return this.zobject.Z1K1;
      },
      set: function(newValue) {
        this.zobject.Z1K1 = newValue;
        this.$emit('input', this.zobject);
      }
    }
  },
  props: ['zobject'],
  data: function() {
    var zkeylabels = mw.config.get('zkeylabels');
    var typeoptions = Object.entries(mw.config.get('ztypes')).map( ([k, v]) => {
      let opt = {};
      opt['value'] = k;
      opt['label'] = v;
      return opt;
    });
    return {
        z1k1label: zkeylabels.Z1K1,
        ztypes: typeoptions
    }
  }
}
</script>
