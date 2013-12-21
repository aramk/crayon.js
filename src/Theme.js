define([
  'jquery',
  'defaults'
], function($, defaults) {
  return {
    themeCssClass: function(id) {
      return defaults.pluginId + '-theme-' + id;
    },
    themeURL: function(id) {
      return defaults.themeDir + '/' + id + '.css';
    }
  };
});
