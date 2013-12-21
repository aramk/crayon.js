define([
  'jquery',
  'util/regex',
  'utility/Log'
], function($, regex, Log) {
  var Elements = function(args) {
    args = args || {};
    this._elements = [] || args.elements;
    this.isLazy = args.isLazy;
    this._compiled = null;
    // Stores a list of the elements used during compilation. The order allows us to determine which group was matched.
    this._elementsArrays = [];
  };
  $.extend(Elements.prototype, {
    setElements: function(elements) {
      elements = elements instanceof Array ? elements : [elements];
      this._elements = elements;
      this._compiled = null;
    },
    getElements: function() {
      return this._elements;
    },
    compile: function() {
      if (!this._compiled) {
        this._compiled = this._compile();
      }
      return this._compiled;
    },
    _compile: function() {
      var regexes = [], me = this;
      me._elementsArrays = [];
      $.each(me.getElements(), function(i, elements) {
        var elementArray = [];
        regexes.push(me.compileElements(elements, function(id, elem) {
          elementArray.push(id);
          return elem;
        }));
        me._elementsArrays.push(elementArray);
      });
      return regexes;
    },
    compileElements: function(elements, map) {
      var regexStr = '', me = this;
      // TODO separate the logic from the data (language definition) while still allowing both to be overridden.
      for (var id in elements) {
        if (id.match(/^_/)) {
          // Ignore any elements with underscore prefix. These can be used to define modifiers for each set of elements.
          continue;
        }
        // TODO rather than remove groups, change algorithm to allow them for more complex regex with functions in elements
        var elem = elements[id];
        if (elem) {
          if (map) {
            elem = map(id, elem);
          }
          elem = me.compileElement(id, elem);
          regexStr += '(' + elem + ')|';
        }
      }
      if (regexStr.length) {
        // Remove trailing character
        regexStr = regexStr.substring(0, regexStr.length - 1);
      } else {
        Log.error('No elements compiled', me);
      }
      // TODO support more than one
      return new RegExp(regexStr, elements._modifiers || regex.modifiers);
    },
    compileElement: function(id, elem) {
      var me = this;
      if (elem === null || typeof elem === 'undefined') {
        return null;
      } else if (elem instanceof Array) {
        elem = regex.alt(elem);
      } else if (elem instanceof Function) {
        elem = elem(me, id);
      } else if (elem instanceof Object && !(elem instanceof RegExp)) {
        // TODO avoided using getTypeOf, might be slower
        elem = regex.alt(elem.items, elem.wordBounded);
      }
      elem = regex.toStr(elem);
      elem = regex.expandBackrefs(elem);
      elem = regex.removeGroups(elem);
      elem = regex.replaceDots(elem);
      return (new RegExp(elem)).source;
    },
    // Changes the behaviour when extending.
    // "add" will add element sets of the source language into the destination language. (recommended/default)
    // "merge" will merge any missing elements from the source language into the destination language for only the first elements set. If more than one elements set exists for the source language, merging is too ambiguous and this option defaults to "add".
    extendMode: "add",
    _compilation: null,
    extend: function(dest) {
      // TODO separate from the language?
      var source = this;
      // Clone this language and deep merge the given one into it.
      var deepCopy = $.extend(true, {}, source);
      // Handle merging of the elements manually.
      delete deepCopy.elements;
      var deepMerge = $.extend(true, deepCopy, dest),
        sourceElems = source.getElements();
      if (dest.extendMode === "merge" && sourceElems.length === 1) {
        var sourceElements = $.extend(true, {}, sourceElems[0]);
        var destElems = dest.getElements();
        if (destElems.length === 0 || !destElems[0]) {
          // Destination elements set is empty, just copy across.
          dest.elements = $.extend(true, {}, sourceElements);
        } else {
          // Merge any missing elements into the first.
          var destElements = destElems[0];
          for (var id in sourceElements) {
            if (!(id in destElements)) {
              destElements[id] = sourceElements[id];
            }
          }
        }
      } else {
        if (!(dest.elements instanceof Array)) {
          dest.elements = [dest.elements];
        }
        deepMerge.elements = dest.elements.concat(sourceElems);
      }
//      console.error('deepMerge', deepMerge);
      return deepMerge;
    }
  });
  return Elements;
});
