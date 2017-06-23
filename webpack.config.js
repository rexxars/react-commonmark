'use strict'

var path = require('path')
var webpack = require('webpack')
var env = JSON.stringify(process.env.NODE_ENV || 'development')

module.exports = {
  entry: [
    path.join(__dirname, 'src', 'react-commonmark.js')
  ],
  output: {
    library: 'reactCommonmark',
    libraryTarget: 'umd',
    path: path.join(__dirname, 'umd'),
    filename: 'react-commonmark.js'
  },
  externals: {
    react: {
      root: 'React',
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react'
    }
  },
  plugins: [
    new webpack.DefinePlugin({'process.env.NODE_ENV': env}),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin()
  ]
}
