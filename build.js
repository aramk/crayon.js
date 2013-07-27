({
  baseUrl: 'src',
  packages: [
    {
      name: 'langs',
      location: '../langs'
    }
  ],
//  name: 'main',
  name: '../lib/almond',
  include: ['main', 'langs/default'],
//  insertRequire: ['src/main'],
  out: 'build/crayon.min.js'
})
