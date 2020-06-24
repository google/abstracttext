<template>
  <div id="zobject-editor">
    <full-zobject :zobject="zobject" :editableid="false" v-on:input="updateZobject"></full-zobject>
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
    zobject = mw.config.get('zobject');
    if (zobject === null) {
      const zid = mw.config.get('wgTitle');
      zobject = {'Z1K2': zid};
    }
    return {
     zobject: zobject,
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
      const page = mw.config.get('wgPageName');
      let api = new mw.Api();
      let self = this;
      if (mw.config.get('zobject') === null) {
        api.create(page, { summary: self.summary },
           JSON.stringify(self.zobject)
        ).then( function() {
          window.location.href = "/index.php/" + page;
        });
      } else {
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
  }
};
</script>

<style lang="less">
.zedit_summary {
  width: 100%;
}
</style>
