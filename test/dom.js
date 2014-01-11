describe('DOM', function() {

  it('creates plugin', function(done) {
    // Each DOM node in this DIV is matched.
    var $html = $('<div><p></p><pre></pre><pre></pre><p></p><div><pre></pre></div><span></span></div>');
    require(['plugin', 'core/Crayon'], function(plugin, Crayon) {
      $html.crayon();
      var name = 'crayon',
        data = $.data($html[0], 'plugin_' + name);
      data.then(function($elems) {
        var crayon = $.data($html[0], 'plugin_' + name + '_instance');
        console.error('$elems', $elems);
        expect(crayon instanceof Crayon).to.be.true;
        done();
      });
    });
  });

  it('highlights code into dom nodes', function(done) {
    var $html = $('<div><pre>if (true) { return 123; }</pre><p>123</p><pre>var a = 1 + 2; alert(a);</pre></div>');
    require(['plugin'], function(plugin) {
      $html.crayon().then(function(result) {
        var $elems = result[0];
        expect($elems.length).to.equal(2);
        expect($elems.get(0) === $('pre', $html).get(0)).to.be.true;
        expect($($elems.get(0)).html()).to.equal('<span class="crayon-statement">if</span> <span class="crayon-symbol">(</span><span class="crayon-statement">true</span><span class="crayon-symbol">)</span> <span class="crayon-symbol">{</span> <span class="crayon-statement">return</span> <span class="crayon-constant">123</span><span class="crayon-symbol">;</span> <span class="crayon-symbol">}</span>');
        expect($($elems.get(1)).html()).to.equal('<span class="crayon-type">var</span> <span class="crayon-variable">a</span> <span class="crayon-operator">=</span> <span class="crayon-constant">1</span> <span class="crayon-operator">+</span> <span class="crayon-constant">2</span><span class="crayon-symbol">;</span> <span class="crayon-entity">alert</span><span class="crayon-symbol">(</span><span class="crayon-identifier">a</span><span class="crayon-symbol">)</span><span class="crayon-symbol">;</span>');
        done();
      });
    });
  });

});
