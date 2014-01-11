(function($, window, document, undefined) {

  // Instantiate the plugin for jQuery
  var name = 'crayon';
  $.fn[name] = function(options) {
    var query = this,
      allDf = $.Deferred(),
      dfs = [],
      crayons = [];
    query.each(function() {
      var df = $.Deferred();
      dfs.push(df);
      // Only runs once per node.
      if (!$.data(this, 'plugin_' + name)) {
        $.data(this, 'plugin_' + name, (function() {
          // Note: This loads asynchronously
          require(['core/Crayon'], function(Crayon) {
            options = $.extend(options, {
              // TODO how do we configure this?
              baseURL: ''
            });
            // TODO save crayon instance?
            var crayon = new Crayon(query, options);
            crayon._name = name;
            crayons.push(crayon);
            crayon.highlight().then(function() {
              df.resolve(crayon);
            }, function(err) {
              df.reject(err);
            });
            return df;
          });
          return df;
        })());
      }
    });
    $.when.apply($, dfs).then(function() {
      allDf.resolve(crayons);
    }, function(err) {
      allDf.reject(err);
    });
    return allDf;
  };

})(jQuery, window, document);
