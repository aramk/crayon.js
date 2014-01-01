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
  include: ['plugin', 'langs/default'],
//  insertRequire: ['src/plugin'],
  out: 'build/crayon.min.js'
})
