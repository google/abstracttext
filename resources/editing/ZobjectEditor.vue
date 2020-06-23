<template>
  <div id="zobject-editor">
    <full-zobject :zobject="zobject" v-on:input="updateZobject"></full-zobject>
    <div>
      <label for="summary">Summary:</label>
      <input class="zedit_summary" name="summary" v-model="summary" ></input>
    </div>
    <button v-on:click="submit">Save changes</button>
    <p>Current ZObject: {{ zobject }} </p>
  </div>
</template>

<script>
var FullZobject = require('./FullZobject.vue');

module.exports = {
  name: 'ZobjectEditor',
  data: function() {
    return {
     zobject: mw.config.get('zobject'),
     summary: ''
    };
  },
  components: {
    'full-zobject': FullZobject
  },
  methods: {
    updateZobject: function(new_zobject) {
      this.zobject = new_zobject;
    },
    submit: function() {
      const zid = this.zobject.Z1K2;
      const page = 'M:' + zid;
      let api = new mw.Api();
      let self = this;
      api.edit(page, function ( revision ) {
        return {
          text: JSON.stringify(self.zobject),
          summary: self.summary
        };
      }).then( function() {
        window.location.href = "/index.php/" + page;
      });
    }
  }
};
</script>

<style lang="less">
.zedit_summary {
  width: 100%;
}
</style>
