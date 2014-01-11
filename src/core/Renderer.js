define([
  'lib/Class',
  'defaults',
  'util/jquery',
  'util/dom',
  'util/format',
  'utility/Log'
], function(Class, defaults, $, dom, format, Log) {
  return Class.extend({

    init: function(options) {
      this.options = options || defaults;
    },

    render: function(args) {
      var content = args.content,
        node = args.node,
        $node = $(node),
        atts = args.atts;
      dom.setHtmlValue(node, content);
      $node.addClass(this.options.pluginId);
      var themeId = atts.theme || this.options.defaultThemeId;
      $node.addClass(this.themeCssClass(themeId));
    },

    themeCssClass: function(id) {
      return this.options.pluginId + '-theme-' + id;
    }

  });
});
