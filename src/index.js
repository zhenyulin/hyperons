import escapeString from './escape-string'
import stringifyAttributes from './stringify-attributes'

// https://www.w3.org/TR/html/syntax.html#void-elements
const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
])

const INNER_HTML = 'dangerouslySetInnerHTML'

// best guess if a child element was rendered by this module
function fragment(node) {
  return /^</.test(node) && />$/.test(node)
}

function vhtml(element, attributes = {}, ...children) {
  if (element === null) {
    return ''
  }

  // support for higher-order components
  if (typeof element === 'function') {
    return element({ ...attributes, children })
  }

  let out = `<${element}`

  if (attributes) {
    out += stringifyAttributes(attributes)
  }

  // if a self-closing void element has children then
  if (VOID_ELEMENTS.has(element)) {
    out += '/>'
  } else {
    out += '>'

    if (attributes && attributes[INNER_HTML] && attributes[INNER_HTML].__html) {
      out += attributes[INNER_HTML].__html
    } else {
      while (children.length) {
        const child = children.shift()

        if (child) {
          // handle nested arrays of children
          if (Array.isArray(child)) {
            children = child.concat(children)
          } else {
            // don't double escape any markup output by this element
            out += fragment(child) ? child : escapeString(child)
          }
        }
      }
    }

    out += `</${element}>`
  }

  return out
}

export default vhtml