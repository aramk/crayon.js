define([
  'lib/Class',
  'defaults',
  'util/jquery',
  'util/dom',
  'util/format',
  'utility/Log'
], function(Class, defaults, $, dom, format, Log) {
  return Class.extend({

    init: function (options) {
      this.options = options || defaults;
    },

    render: function (args) {
      var output = args.output,
        node = args.node,
        $node = $(node),
        atts = args.atts;
      if (output && output.length) {
        dom.setHtmlValue(node, output);
      } else {
        Log.error('Compilation returned no output', output);
      }
      $node.addClass(this.options.pluginId);
      var themeId = atts.theme || this.options.defaultThemeId;
      $node.addClass(this.themeCssClass(themeId));
    },

    themeCssClass: function(id) {
      return this.options.pluginId + '-theme-' + id;
    }

  });
});
