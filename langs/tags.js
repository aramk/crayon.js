define([
], function() {
  return {
    // TODO(aramk) generate these from the languages directly
    php: /<\?(?:php)?.*?\?\>/,
    js: /<script\b[^\>]*>.*?<\/script>/,
    css: /<style\b[^\>]*>.*?<\/style>/,
    ruby: /(<%.*?%>)|(^%.*?[\r\n])/
  };
});
