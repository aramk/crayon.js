require([
  'jquery' // src/jquery.js
], function ($) {

  var defaults = {

  };

  function Loader(options) {
    this.options = $.extend({}, defaults, options);
  }

  Loader.prototype = {

    init: function () {

    }

  };

  return Loader;

});
