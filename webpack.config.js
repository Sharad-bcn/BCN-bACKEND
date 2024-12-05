var webpack = require('webpack')
var path = require('path')
// var fs = require('fs')

const entry = './index.js'
const output = path.resolve(__dirname, 'build')
const mode = 'production'

console.log(`Creating server build for ${mode}`)

module.exports = {
  entry: entry,

  output: {
    path: output,
    filename: 'server.build.js'
  },

  module: {
    rules: [
      {
        test: /\.js?$/,
        use: 'babel-loader'
        // exclude: /node_modules/
      }
    ]
  },

  mode: mode,

  context: __dirname,
  node: {
    __filename: true
  },

  target: 'node'
}
