module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt, [ 'grunt-*']);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    mocha: {
      test: {
        src: ['test/**/*.html'],
        options: {
          run: true,
          log: true
        }
      }
    },
    mochaTest: {
      test: {
        src: ['test/**/*-test.js']
      }
    }
  });

  grunt.registerTask('tests', ['mocha', 'mochaTest']);
  grunt.registerTask('tests-unit', ['mochaTest']);
  grunt.registerTask('tests-system', ['mocha']);
//  grunt.registerTask('docs', ['mocha', 'mochaTest']);

};
