(function ($, window, document, undefined) {

  console.error(1);

  var pluginName = 'crayon',
      defaults = {
        propertyName: 'value'
      };

  function Plugin(element, options) {
    console.error('construct');

    this.element = element;

    this.options = $.extend({}, defaults, options);

    this._defaults = defaults;
    this._name = pluginName;

    this.init();
  }

  // Define plugin
  Plugin.prototype = {

    init: function () {
      console.error('init');
      // Run loader
      // Cache languages
      // Pass to compiler
    }

  };

  // Instantiate the plugin for jQuery
  $.fn[pluginName] = function (options) {
    console.error('selector');
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        console.error('new');
        $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
      }
    });
  };

})(jQuery, window, document);
