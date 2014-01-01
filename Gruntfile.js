module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    mocha: {
      test: {
        src: ['test/**/*.html'],
        options: {
          run: true
        }
      }
    },
    mochaTest: {
      test: {
        src: ['test/**/*-test.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.registerTask('default', ['mocha', 'mochaTest']);

};
