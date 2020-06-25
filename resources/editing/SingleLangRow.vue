<template>
  <div class="zlabel_row">
    <div class="zlabel_cell"> {{langlabel}} ({{ lang_zid }})</div>
    <div class="zlabel_cell"> <input v-model="label" class="zlabel_input"></input></div>
    <div class="zdesc_cell"> <input v-model="desc" class="zlabel_input"></input></div>
    <div class="zalias_cell"> <input v-model="aliases" class="zlabel_input"></input></div>
  </div>
</template>

<script>
function find_matches_in_object(match_value, obj, list_keys, value_key) {
  let matches = [];
  for (key of list_keys) {
    if (key in obj) {
      obj = obj[key];
    } else {
      return matches;
    }
  }
  matches = obj.filter(
    function(entry) {
      return entry[value_key] == match_value;
    }
  );
  return matches;
}

module.exports = {
  name: 'SingleLangRow',
  props: ['zobject', 'lang_zid'],
  data: function() {
    const zlanguages = mw.config.get('zlanguages');
    return {
        langlabel: zlanguages[this.lang_zid]
    }
  },
  computed: {
    label: {
      get: function() {
        lbl = '';
        matches = find_matches_in_object(this.lang_zid,
          this.zobject, ['Z1K3', 'Z12K1'], 'Z11K1');
        if (matches.length > 0) {
          lbl = matches[0].Z11K2;
        }
        return lbl;
      },
      set: function(newValue) {
        matches = find_matches_in_object(this.lang_zid,
          this.zobject, ['Z1K3', 'Z12K1'], 'Z11K1');
        if (matches.length > 0) {
          matches[0].Z11K2 = newValue;
        } else {
          if (! ('Z1K3' in this.zobject) ) {
            this.$set(this.zobject, 'Z1K3', {'Z1K1': 'Z12'});
          }
          if (! ('Z12K1' in this.zobject.Z1K3) ) {
            this.$set(this.zobject.Z1K3, 'Z12K1', []);
          }
          this.zobject.Z1K3.Z12K1.push({'Z1K1': 'Z11', 'Z11K1': this.lang_zid, 'Z11K2': newValue});
        }
        this.$emit('input', this.zobject);
      }
    },
    desc: {
      get: function() {
        lbl = '';
        matches = find_matches_in_object(this.lang_zid,
          this.zobject, ['Z1K4', 'Z12K1'], 'Z11K1');
        if (matches.length > 0) {
          lbl = matches[0].Z11K2;
        }
        return lbl;
      },
      set: function(newValue) {
        matches = find_matches_in_object(this.lang_zid,
          this.zobject, ['Z1K4', 'Z12K1'], 'Z11K1');
        if (matches.length > 0) {
          matches[0].Z11K2 = newValue;
        } else {
          if (! ('Z1K4' in this.zobject)) {
            this.$set(this.zobject, 'Z1K4', {'Z1K1': 'Z12'});
          }
          if (! ('Z12K1' in this.zobject.Z1K4)) {
            this.$set(this.zobject.Z1K4, 'Z12K1', []);
          }
          this.zobject.Z1K4.Z12K1.push({'Z1K1': 'Z11', 'Z11K1': this.lang_zid, 'Z11K2': newValue});
        }
        this.$emit('input', this.zobject);
      }
    },
    aliases: {
      get: function() {
        matches = find_matches_in_object(this.lang_zid,
          this.zobject, ['Z1K5'], 'Z11K1');
        return matches.map( function(entry) { return entry.Z11K2; } ).join(' ');
      },
      set: function(newValue) {
        aliases = newValue.split(' ');
        if (aliases.length > 0) {
          if (! ('Z1K5' in this.zobject)) {
            this.$set(this.zobject, 'Z1K5', []);
          } else {
            let lang_zid = this.lang_zid;
            this.zobject.Z1K5 = this.zobject.Z1K5.filter(
              function(entry) {
                if (entry.Z11K1 == lang_zid) { return false };
                return true;
              }
            );
          }
          for (alias of aliases) {
            this.zobject.Z1K5.push({'Z1K1': 'Z11', 'Z11K1': this.lang_zid, 'Z11K2': alias});
          }
        }
        this.$emit('input', this.zobject);
      }
    }
  },
}
</script>

<style lang="less">
.zlabel_input {
  width: 100%;
  box-sizing: border-box;
}
</style>
