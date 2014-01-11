(function($, window, document, undefined) {

  // Instantiate the plugin for jQuery
  var name = 'crayon',
    crayon;

  $.fn[name] = function(options) {
    var query = this,
      results = [],
      resultDf = $.Deferred(),
      dfs = [];
    query.each(function() {
      var df = $.Deferred(),
        node = this;
      dfs.push(df);
      // Only runs once per node.
      if (!$.data(this, 'plugin_' + name)) {
        $.data(this, 'plugin_' + name, (function() {
          require(['core/Crayon'], function(Crayon) {
            options = $.extend(options, {
              // TODO how do we configure this?
              baseURL: ''
            });
            if (!crayon) {
              crayon = new Crayon(options);
              crayon._name = name;
            }
            $.data(node, 'plugin_' + name + '_instance', crayon);
            crayon.highlight(query).then(function(result) {
              results.push(result);
              df.resolve(result);
            }, function(err) {
              df.reject(err);
            });
            return df;
          });
          return df;
        })());
      }
    });
    $.when.apply($, dfs).then(function () {
      resultDf.resolve(results);
    }, function (err) {
      resultDf.reject(err);
    });
    return resultDf;
  };

})(jQuery, window, document);
