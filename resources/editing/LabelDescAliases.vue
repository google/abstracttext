<template>
  <table class="zobject_label_box">
    <tbody v-if="used_lang_list.length > 0">
    <tr>
      <th>{{ languagetypelabel }}</th>
      <th>{{ z1k3label }} (Z1K3)</th>
      <th>{{ z1k4label }} (Z1K4)</th>
      <th>{{ z1k5label }} (Z1K5)</th>
    </tr>
    <single-lang-row v-for="lang_zid in used_lang_list" :zobject="zobject" :lang_zid="lang_zid" :key="lang_zid" v-on:input="update_zobject" />
    <tr>
      <td> 
        <select v-bind:value="newlang" v-on:change="addNewLang">
          <option selected disabled value="None">+ {{ languagetypelabel }}</option>
          <option v-for="lang in unused_lang_list" v-bind:value="lang.zid">
            {{ lang.label }} ({{ lang.zid }})
          </option>
        </select>
      </td>
      <td colspan="3"></td>
    </tr>
    </tbody>
    <tbody v-else>
      <tr><td>unlabeled</td> 
        <td><select v-bind:value="newlang" v-on:change="addNewLang">
          <option selected disabled value="None">+ {{ languagetypelabel }}</option>
          <option v-for="lang in unused_lang_list" v-bind:value="lang.zid">
            {{ lang.label }} ({{ lang.zid }})
          </option>
        </select></td></tr>
    </tbody>
  </table>
</template>

<script>
var SingleLangRow = require('./SingleLangRow.vue');

module.exports = {
  name: 'LabelDescAliases',
  props: ['zobject'],
  data: function() {
    const ztypes = mw.config.get('ztypes');
    const zkeylabels = mw.config.get('zkeylabels');
    const all_langs = mw.config.get('zlanguages');
    used_lang_list = [];
    if ('Z1K3' in this.zobject) {
      if ('Z12K1' in this.zobject.Z1K3) {
        for (entry of this.zobject.Z1K3.Z12K1) {
          used_lang_list.push(entry.Z11K1);
        }
      }
    }
    unused_lang_list = [];
    for (lang in all_langs) {
      if (! (used_lang_list.includes(lang)) ) {
        unused_lang_list.push({zid: lang, label: all_langs[lang]});
      }
    }
    
    return {
        z1k3label: zkeylabels.Z1K3,
        z1k4label: zkeylabels.Z1K4,
        z1k5label: zkeylabels.Z1K5,
        used_lang_list: used_lang_list,
        unused_lang_list: unused_lang_list,
        languagetypelabel: ztypes.Z180
    }
  },
  computed: {
    newlang: function() {
      return 'None';
    }
  },
  components: {
    'single-lang-row': SingleLangRow
  },
  methods: {
    addNewLang: function(event) {
      zlang_id = event.target.value;
      if (zlang_id.startsWith("Z") && ! this.used_lang_list.includes(zlang_id) ) {
        this.used_lang_list.push(zlang_id);
        this.unused_lang_list = this.unused_lang_list.filter(
            function(lang) { return lang.zid != zlang_id; }
          );
      }
    },
    update_zobject: function(new_zobject) {
      this.zobject = new_zobject;
      this.$emit('input', this.zobject);
    }
  }
}
</script>

<style lang="less">
.zobject_label_box {
  outline: 1px solid #808080;
}
</style>
