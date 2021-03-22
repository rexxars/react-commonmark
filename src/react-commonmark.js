'use strict'

var React = require('react')
var Parser = require('commonmark').Parser
var ReactRenderer = require('@sonatype/commonmark-react-renderer')
var propTypes = require('prop-types')

function ReactCommonmark (props) {
  React.Component.call(this, props)
}

ReactCommonmark.prototype = Object.create(React.Component.prototype)
ReactCommonmark.prototype.constructor = ReactCommonmark

ReactCommonmark.prototype.render = function () {
  var containerProps = this.props.containerProps || {}
  var renderer = new ReactRenderer(this.props)
  var parser = new Parser(this.props.parserOptions)
  var ast = parser.parse(this.props.source || '')

  if (this.props.walker) {
    var walker = ast.walker()
    var event

    while ((event = walker.next())) {
      this.props.walker.call(this, event, walker)
    }
  }

  if (this.props.className) {
    containerProps.className = this.props.className
  }

  var args = [this.props.containerTagName, containerProps, this.props.childBefore]
  args = args.concat(renderer.render(ast).concat([this.props.childAfter]))

  return React.createElement.apply(React, args)
}

ReactCommonmark.propTypes = {
  className: propTypes.string,
  containerProps: propTypes.object,
  source: propTypes.string.isRequired,
  containerTagName: propTypes.string,
  childBefore: propTypes.object,
  childAfter: propTypes.object,
  sourcePos: propTypes.bool,
  escapeHtml: propTypes.bool,
  skipHtml: propTypes.bool,
  softBreak: propTypes.string,
  allowNode: propTypes.func,
  allowedTypes: propTypes.array,
  disallowedTypes: propTypes.array,
  transformLinkUri: propTypes.func,
  transformImageUri: propTypes.func,
  unwrapDisallowed: propTypes.bool,
  renderers: propTypes.object,
  walker: propTypes.func,
  parserOptions: propTypes.object
}

ReactCommonmark.defaultProps = {
  containerTagName: 'div',
  parserOptions: {}
}

ReactCommonmark.types = ReactRenderer.types
ReactCommonmark.renderers = ReactRenderer.renderers
ReactCommonmark.uriTransformer = ReactRenderer.uriTransformer

module.exports = ReactCommonmark
