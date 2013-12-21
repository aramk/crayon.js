define([
], function () {
  return {
    spacesInTabString: function() {
      return new Array(defaults.lang.spacesInTab).join(' ');
    },
    convertTabs: function(value) {
      return value.replace(/\t/g, this.spacesInTabString());
    },
    convertSpaces: function(value) {
      return value.replace(this.spacesInTabString(), '\\t');
    },
    encodeEntities: function(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    },
    decodeEntities: function(value) {
      return String(value)
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
    },
    transformIndent: function(value) {
      if (this.indent == 'spaces') {
        value = this.convertTabs(value);
      } else if (this.indent == 'tabs') {
        value = this.convertSpaces(value);
      }
      return value;
    },
    // TODO use better name for value variable
    transform: function(matchValue, args) {
      matchValue = this.encodeEntities(matchValue);
      return '<span class="' + lang.cssPrefix + '-' + args.element + '">' + matchValue + '</span>';
    }
  };
});
