<template>
  <div>
      <span>{{ z1k1label }} (Z1K1): </span>
    <select v-model="type">
       <option v-for="ztype in ztypes" v-bind:value="ztype.value">
         {{ ztype.label }} ({{ ztype.value }})
       </option>
    </select>
    <span> {{ z1k2label}} (Z1K2): </span>
    <input v-if="editableid" v-model="zobject_id"></input>
    <span v-else> {{ zobject_id }} </span>
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
    },
    zobject_id: {
      get: function() {
        return this.zobject.Z1K2;
      },
      set: function(newValue) {
        this.zobject.Z1K2 = newValue;
        this.$emit('input', this.zobject);
      }
    }
  },
  props: ['zobject', 'editableid'],
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
        z1k2label: zkeylabels.Z1K2,
        ztypes: typeoptions
    }
  }
}
</script>
