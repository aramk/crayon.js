({
  baseUrl: '.',
  packages: [
    {
      name: 'jquery',
      location: 'lib',
      main: 'jquery'
    }
  ],
  exclude: ['jquery'],
  name: 'src/main',
  out: 'build/crayon.min.js'
})
