({
  baseUrl: '.',
  packages: [
//    {
//      name: 'jquery',
//      location: 'lib'
//    },
//    {
//      name: 'src',
//      location: 'src'
//    }
  ],
  // TODO doesn't work
  exclude: ['jquery'],
  excludeShallow: ['jquery'],
  name: 'src/main',
  out: 'build/crayon.min.js'
})
