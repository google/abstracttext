( function() {
    const Vue = require('vue');
    const ZobjectEditor = require('./ZobjectEditor.vue');

    new Vue({
      el: '#zobject-editor',
      render: function ( h ) {
        return h( ZobjectEditor );
      }
    });
}() );
