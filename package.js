const fs = require('fs-extra')
const pug = require('pug')
const requireDir = require('require-dir')
// const content = requireDir('./data/content', {recurse: true})
const content = require('./data/content')

// render and write file
fs.writeFile('./docs/index.html', pug.renderFile('./components/app/index.pug', content), error => {
  if (error) console.log('Error rendering HTML', error)
  else console.log('Rendered HTML')
})

fs.copy('./content', './docs/content', function (err) {
  if (err) return console.error(err)
  console.log('success!')
}) // copies directory, even if it has subdirectories or files

fs.copy('./bundle', './docs/bundle', function (err) {
  if (err) return console.error(err)
  console.log('success!')
}) // copies directory, even if it has subdirectories or files
