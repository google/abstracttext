<template>
  <ul>
     <li v-for="(value, key) in otherkeydata" :key="key">
      <button v-on:click="removeEntry(key)" >-</button>
      <span>{{ zkeylabels[key] }} ({{ key }}):</span>
      <input v-if="keyTypes[key] === 'string'" :value="value" v-on:input="update_string_key($event, key)" ></input>
      <full-zobject v-else-if="keyTypes[key] === 'zobject'" :zobject="zobject[key]" :editableid="true" v-on:input="update_key($event, key)" ></full-zobject>
      <list-value v-else-if="keyTypes[key] === 'list'" :list="zobject[key]" v-on:input="update_key($event, key)" ></list-value>
      <select v-else v-on:change="setKeyType($event, key)">
        <option selected disabled value="None">Value Type</option>
        <option value="string">String or Reference</option>
        <option value="zobject">ZObject</option>
        <option value="list">List</option>
      </select>
     </li>
     <li>+ {{keylabel}}: <input v-on:change="addNewKey($event)" ></input> </li>
  </ul>
</template>

<script>
var FullZobject = require('./FullZobject.vue');
var ListValue = require('./ListValue.vue');

module.exports = {
  name: 'OtherKeys',
  props: ['zobject'],
  created: function () {
    this.fetchKeyLabels();
  },
  data: function() {
    const ztypes = mw.config.get('ztypes');
    let zkeylabels = mw.config.get('zkeylabels');
    let otherkeydata = {};
    let keyTypes = {};
    for (let [key, value] of Object.entries(this.zobject)) {
      if (! (key.startsWith('Z1K')) ) {
        otherkeydata[key] = value;
      }
      if (! (key in zkeylabels) ) {
        zkeylabels[key] = key;
      }
      if (typeof(value) === 'object') {
        if (Array.isArray(value)) {
          keyTypes[key] = 'list';
        } else {
          keyTypes[key] = 'zobject';
        }
      } else {
        keyTypes[key] = 'string';
      }
    }
    return {
      keylabel: ztypes.Z3,
      keyTypes: keyTypes,
      otherkeydata: otherkeydata,
      zkeylabels: zkeylabels
    };
  },
  methods: {
    addNewKey: function(event) {
      key = event.target.value;
      if (key.match(/^Z\d+K\d+$/) ) {
        this.$set(this.otherkeydata, key, '');
        if (! (key in this.zkeylabels) ) {
          this.$set(this.zkeylabels, key, key);
          this.$set(this.keyTypes, key, 'new');
          this.fetchKeyLabels();
        }
      }
    },
    fetchKeyLabels: function() {
      const zlang = mw.config.get('zlang');
      let api = new mw.Api({});
      let self = this;
      for (let [key, value] of Object.entries(this.zkeylabels)) {
        if (key != value) { continue; }
        api.get( {
          action: 'abstracttext',
          getKeyLabel: true,
          keyid: key,
          zlang: zlang
        } ).done ( function ( data ) {
           self.$set(self.zkeylabels, key, data[key]);
        } );
      }
    },
    setKeyType: function(event, key) {
      newtype = event.target.value;
      if (newtype === 'zobject') {
        this.$set(this.zobject, key, {});
      } else if (newtype === 'list') {
        this.$set(this.zobject, key, []);
      } else {
        this.$set(this.zobject, key, '');
      }
      this.$set(this.keyTypes, key, newtype);
    },
    update_key: function(value, key) {
      this.$set(this.zobject, key, value);
      this.$emit('input', this.zobject);
    },
    update_string_key: function(event, key) {
      this.$set(this.zobject, key, event.target.value);
      this.$emit('input', this.zobject);
    },
    removeEntry: function(key) {
      this.$delete(this.zobject, key);
      this.$delete(this.otherkeydata, key);
      this.$delete(this.keyTypes, key);
      this.$emit('input', this.zobject);
    }
  },
  components: {
    'full-zobject': FullZobject,
    'list-value': ListValue
  }
}
</script>
