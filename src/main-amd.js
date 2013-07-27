require.config({
  baseUrl: 'src'
});

require([
  'jquery' // src/jquery.js
], function ($, undefined) {

  console.error(1);

  var pluginName = 'crayon',
      defaults = {
        propertyName: 'value'
      };

  function Plugin( element, options ) {
    this.element = element;

    this.options = $.extend( {}, defaults, options );

    this._defaults = defaults;
    this._name = pluginName;

    this.init();
  }

  // Define plugin
  Plugin.prototype = {

    init: function() {

    }

  };

  // Instantiate the plugin for jQuery
  $.fn[pluginName] = function ( options ) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
      }
    });
  };

});
