'use strict'

var mocha = require('mocha')
var React = require('react')
var ReactDom = require('react-dom')
var TestUtils = require('react-dom/test-utils')
var jsdom = require('mocha-jsdom')
var expect = require('chai').expect
var ReactCommonmark = require('../')

var describe = mocha.describe
var it = mocha.it

function firstNonCommentChild (parent) {
  var children = ReactDom.findDOMNode(parent).childNodes
  for (var i = 0; i < children.length; i++) {
    if (children[i].nodeName !== '#comment') {
      return children[i]
    }
  }

  throw new Error('No child node found on parent that was not a comment')
}

function uncommentify (src) {
  return src.replace(/<!--.*?-->/g, '')
}

describe('ReactCommonmark', function () {
  jsdom()

  var testDate = (new Date()).toString()
  var testMarkup = [
    '# Demo\n\n',
    'I was *rendered* using __React__ at ' + testDate,
    ' and it was so much FUN!', '\n\n',
    'Lets do it <i>again</i>!\nYeah?'
  ].join('')

  it('should not set a class on container if no className is passed as prop', function () {
    var rendered = TestUtils.renderIntoDocument(
      React.createElement(ReactCommonmark, { source: testMarkup })
    )

    expect(ReactDom.findDOMNode(rendered).getAttribute('class')).to.equal(null)
  })

  it('should set a class on container if className is passed as prop', function () {
    var rendered = TestUtils.renderIntoDocument(
      React.createElement(ReactCommonmark, { source: testMarkup, className: 'foo bar' })
    )

    expect(ReactDom.findDOMNode(rendered).getAttribute('class')).to.equal('foo bar')
  })

  it('should set custom prop htmlFor on the container if props are passed as prop', function () {
    var rendered = TestUtils.renderIntoDocument(
      React.createElement(ReactCommonmark, {
        source: testMarkup,
        containerProps: {
          htmlFor: 'myElementID'
        }
      })
    )

    expect(ReactDom.findDOMNode(rendered).getAttribute('for')).to.equal('myElementID')
  })

  it('should render before and after children if passed as props', function () {
    var beforeText = 'Hello again'
    var afterText = 'friend of a friend'

    var rendered = TestUtils.renderIntoDocument(
      React.createElement(ReactCommonmark, {
        source: testMarkup,
        childBefore: React.createElement('ul', null, beforeText),
        childAfter: React.createElement('a', null, afterText)
      })
    )

    expect(ReactDom.findDOMNode(rendered).firstChild.innerHTML).to.equal(beforeText)
    expect(ReactDom.findDOMNode(rendered).lastChild.innerHTML).to.equal(afterText)
  })

  it('should set custom prop ID on the container if props are passed as prop', function () {
    var rendered = TestUtils.renderIntoDocument(
      React.createElement(ReactCommonmark, {
        source: testMarkup,
        containerProps: {
          id: 'myElementID'
        }
      })
    )

    expect(ReactDom.findDOMNode(rendered).getAttribute('id')).to.equal('myElementID')
  })

  it('should have rendered a div with the right children', function () {
    var rendered = TestUtils.renderIntoDocument(
      React.createElement(ReactCommonmark, { source: testMarkup })
    )

    expect(ReactDom.findDOMNode(rendered).tagName).to.equal('DIV')
    expect(ReactDom.findDOMNode(rendered).innerHTML).to.contain(testDate)

    var h1 = TestUtils.findRenderedDOMComponentWithTag(rendered, 'h1')
    expect(ReactDom.findDOMNode(h1).innerHTML).to.equal('Demo')

    var em = TestUtils.findRenderedDOMComponentWithTag(rendered, 'em')
    expect(firstNonCommentChild(em).nodeValue).to.equal('rendered')

    var strong = TestUtils.findRenderedDOMComponentWithTag(rendered, 'strong')
    expect(firstNonCommentChild(strong).nodeValue).to.equal('React')

    var ps = TestUtils.scryRenderedDOMComponentsWithTag(rendered, 'p')
    expect(ps).to.have.length(2)
  })

  it('can specify different container tag name', function () {
    var rendered = TestUtils.renderIntoDocument(
      React.createElement(ReactCommonmark, { source: testMarkup, containerTagName: 'section' })
    )

    expect(ReactDom.findDOMNode(rendered).tagName).to.equal('SECTION')
  })

  it('can be told to use <br> for soft-breaks', function () {
    var rendered = TestUtils.renderIntoDocument(
      React.createElement(ReactCommonmark, { source: testMarkup, softBreak: 'br' })
    )

    var strong = TestUtils.findRenderedDOMComponentWithTag(rendered, 'br')
    expect(Boolean(strong)).to.equal(true)
  })

  it('can be told to output sourcemaps as data attributes', function () {
    var rendered = TestUtils.renderIntoDocument(
      React.createElement(ReactCommonmark, { source: testMarkup, sourcePos: true })
    )

    var h1 = TestUtils.findRenderedDOMComponentWithTag(rendered, 'h1')
    expect(ReactDom.findDOMNode(h1).getAttribute('data-sourcepos')).to.equal('1:1-1:6')
  })

  it('can be told to escape html', function () {
    var rendered = TestUtils.renderIntoDocument(
      React.createElement(ReactCommonmark, { source: testMarkup, escapeHtml: true })
    )

    var ps = TestUtils.scryRenderedDOMComponentsWithTag(rendered, 'p')
    expect(ReactDom.findDOMNode(ps[1]).innerHTML).to.contain('&lt;i&gt;')
  })

  it('can be told to skip HTML', function () {
    var rendered = TestUtils.renderIntoDocument(
      React.createElement(ReactCommonmark, { source: testMarkup, skipHtml: true })
    )

    var ps = TestUtils.scryRenderedDOMComponentsWithTag(rendered, 'p')
    expect(ReactDom.findDOMNode(ps[1]).innerHTML).to.not.contain('<i>')
    expect(ReactDom.findDOMNode(ps[1]).innerHTML).to.not.contain('&lt;i&gt;')
  })

  it('can be given a node filtering function', function () {
    var input = 'I accidentally **removed** the whole word'
    var filter = function (node) {
      return node.type !== 'Strong'
    }
    var rendered = TestUtils.renderIntoDocument(
      React.createElement(ReactCommonmark, { source: input, allowNode: filter })
    )

    var main = ReactDom.findDOMNode(rendered).innerHTML
    expect(main).to.not.contain('<strong')
  })

  it('does not allow javascript, vbscript or file protocols by default', function () {
    var source = [
      '# [Much fun](javascript:alert("foo"))',
      'Can be had with [XSS links](vbscript:foobar(\'test\'))',
      '> And [other](VBSCRIPT:bap) nonsense... [files](file:///etc/passwd) for instance',
      '## [Entities](javascript&#x3A;alert("bazinga")) can be tricky, too'
    ].join('\n\n')

    var rendered = TestUtils.renderIntoDocument(
      React.createElement(ReactCommonmark, { source: source })
    )

    var links = TestUtils.scryRenderedDOMComponentsWithTag(rendered, 'a')
    expect(ReactDom.findDOMNode(links[0]).getAttribute('href')).to.equal('x-javascript:alert(%22foo%22)')
    expect(ReactDom.findDOMNode(links[1]).getAttribute('href')).to.equal('x-vbscript:foobar(\'test\')')
    expect(ReactDom.findDOMNode(links[2]).getAttribute('href')).to.equal('x-VBSCRIPT:bap')
    expect(ReactDom.findDOMNode(links[3]).getAttribute('href')).to.equal('x-file:///etc/passwd')
    expect(ReactDom.findDOMNode(links[4]).getAttribute('href')).to.equal('x-javascript:alert(%22bazinga%22)')
  })

  it('allows specifying a custom URI-transformer', function () {
    var src = 'Received a great [pull request](https://github.com/rexxars/react-commonmark/pull/15) today'
    var rendered = TestUtils.renderIntoDocument(
      React.createElement(ReactCommonmark, {
        source: src,
        transformLinkUri: function (uri) {
          return uri.replace(/^https?:\/\/github\.com\//i, '/')
        }
      })
    )

    var links = TestUtils.scryRenderedDOMComponentsWithTag(rendered, 'a')
    expect(ReactDom.findDOMNode(links[0]).getAttribute('href')).to.equal('/rexxars/react-commonmark/pull/15')
  })

  it('allows a walker callback', function () {
    var walker = function (event) {
      if (event.entering && event.node.type === 'strong') {
        event.node.firstChild.literal = 'walker'
      }
    }

    var rendered = TestUtils.renderIntoDocument(
      React.createElement(ReactCommonmark, { source: testMarkup, walker: walker })
    )

    var main = uncommentify(ReactDom.findDOMNode(rendered).innerHTML)
    expect(main).to.contain('walker</strong>')
  })

  it('should pass options correctly to the parser', function () {
    var src = '"He\'s gone totally off--it\'s wild."'
    var rendered = TestUtils.renderIntoDocument(
      React.createElement(ReactCommonmark, {
        source: src,
        parserOptions: { smart: true }
      })
    )
    var main = ReactDom.findDOMNode(rendered).innerHTML
    expect(main).to.contain('“He’s gone totally off–it’s wild.”')
  })
})
