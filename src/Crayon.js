define([
  'jquery', // src/jquery.js,
   'defaults'
], function ($, defaults) {

  function Crayon(element, options) {
    console.error('construct');
    this.element = element;
    this.options = $.extend({}, defaults, options);
    this.init();
  }

  // Define plugin
  Crayon.prototype = {

    init: function () {
      console.error('init');
    }

  };

  return Crayon;

});
