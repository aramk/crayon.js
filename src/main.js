// RequireJS not used to ensure plugin is usable synchronously
(function ($, window, document, undefined) {

  console.error('require', require);

  require.config({
    baseUrl: 'src',
    packages: [
      {
        name: 'langs',
        location: '../langs'
      }
    ]
  });

  // Instantiate the plugin for jQuery
  var name = 'crayon';
  $.fn[name] = function (options) {
    var query = this;
    return query.each(function () {
      if (!$.data(this, 'plugin_' + name)) {
        $.data(this, 'plugin_' + name, (function () {
          // Note: This loads asynchronously
          require(['Crayon'], function (Crayon) {
            options = $.extend(options, {
              // TODO how do we configure this?
              baseURL: ''
            });
            var crayon = new Crayon(query, options);
            crayon._name = name;
            console.log('crayon', crayon);
            // TODO save crayon instance?
          });
        })());
      }
    });
  };

})(jQuery, window, document);
