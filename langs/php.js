define([
  './default',
  'utility/Log'
], function (defaultLang, Log) {
  // TODO we need to extend this for other languages and override
  return defaultLang.extend({
    info: {
      name: 'PHP'
    }
  });
});
