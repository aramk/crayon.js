define([
  'jquery' // src/jquery.js
], function ($) {

  function Crayon(element, options) {
    this.element = element;
    console.error('construct');

    this.options = $.extend({}, defaults, options);

    this._defaults = defaults;
//    this._name = pluginName;

    this.init();
  }

  Crayon._name = 'crayon';

//  var pluginName = 'crayon',
  var defaults = {
        propertyName: 'value'
      };

  // Define plugin
  Crayon.prototype = {

    init: function () {
      console.error('init');
    }

  };

  return Crayon;

});
