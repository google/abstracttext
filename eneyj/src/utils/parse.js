// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
'use strict'
/* eslint-disable no-eval */

const i = require('./../index.js')
const c = i.constants
const u = i.utils

const TOKEN = 'token'
const STRING = 'string'
const OPEN = '('
const CLOSE = ')'
const START = '['
const END = ']'
const COMMA = ','
const QUOTE = '"'
const ESCAPE = '\\'
const SPACE = ' '
const EMPTY = ''

const ARRAY = '[]'

const tokenize = text => {
  let token = EMPTY
  const tokens = []
  let inString = false
  let inEscape = false
  for (let ch of text) {
    if (inString) {
      if (inEscape) {
        if (ch === QUOTE) {
          token += ch
          inEscape = false
        } else if (ch === ESCAPE) {
          token += '\\\\'
          inEscape = false
        } else if (ch === 'n') {
          token += '\\n'
          inEscape = false
        } else {
          return [c.ERROR, c.error.INVALID_STRING_LITERAL, text]
        }
      } else {
        if (ch === QUOTE) {
          tokens.push({ type: STRING, text: token })
          token = EMPTY
          inString = false
        } else if (ch === ESCAPE) {
          inEscape = true
        } else {
          token += ch
        }
      }
    } else {
      if (/[a-z_A-Z0-9]/.test(ch)) {
        token += ch
      } else if (ch === OPEN) {
        if (token !== EMPTY) {
          tokens.push({ type: TOKEN, text: token })
          token = EMPTY
        }
        tokens.push({ type: OPEN })
      } else if (ch === CLOSE) {
        if (token !== EMPTY) {
          tokens.push({ type: TOKEN, text: token })
          token = EMPTY
        }
        tokens.push({ type: CLOSE })
      } else if (ch === START) {
        if (token !== EMPTY) {
          tokens.push({ type: TOKEN, text: token })
          token = EMPTY
        }
        tokens.push({ type: START })
      } else if (ch === END) {
        if (token !== EMPTY) {
          tokens.push({ type: TOKEN, text: token })
          token = EMPTY
        }
        tokens.push({ type: END })
      } else if (ch === SPACE) {
        if (token !== EMPTY) {
          tokens.push({ type: TOKEN, text: token })
          token = EMPTY
        }
      } else if (ch === COMMA) {
        if (token !== EMPTY) {
          tokens.push({ type: TOKEN, text: token })
          token = EMPTY
        }
        tokens.push({ type: COMMA })
      } else if (ch === QUOTE) {
        if (token !== EMPTY) {
          tokens.push({ type: TOKEN, text: token })
          token = EMPTY
        }
        inString = true
      } else {
        return [c.ERROR, c.error.UNKNOWN_TOKEN, ch]
      }
    }
  }
  if (token !== EMPTY) {
    tokens.push({ type: TOKEN, text: token })
    token = EMPTY
  }
  if (inString) {
    return [c.ERROR, c.error.UNBALANCED_QUOTES, text]
  }
  return tokens
}

const root = tokens => {
  if (tokens.length === 0) {
    return i.error(c.error.SYNTAX_ERROR, JSON.stringify(tokens), 'root')
  }
  let str = '['
  for (let token of tokens) {
    if (token.type === TOKEN) {
      str += '"' + token.text + '"'
    } else if (token.type === OPEN) {
      str += ', ['
    } else if (token.type === CLOSE) {
      str += ']'
    } else if (token.type === START) {
      str += '"' + ARRAY + '", ['
    } else if (token.type === END) {
      str += ']'
    } else if (token.type === COMMA) {
      str += ', '
    } else if (token.type === STRING) {
      str += "'\"" + token.text.replace("'", "\\'") + "\"'"
    }
  }
  str += ']'

  str = str.replace(/, \[\]/g, '')
  str = str.replace(/\[, /g, '[')

  try {
    var tree = eval(str)
  } catch (err) {
    return i.error(c.error.SYNTAX_ERROR, JSON.stringify(tokens), 'root')
  }
  return { Z1K1: tree }
}

const splitArgs = args => {
  const result = []
  let last = 0
  for (let i = 0; i < args.length; i++) {
    if ((typeof args[i] === 'string') && (i > 0)) {
      var trafo = transform(args.slice(last, i))
      result.push({ argument_value: trafo })
      last = i
    }
  }
  if (last === args.length) return result
  trafo = transform(args.slice(last))
  result.push({ argument_value: trafo })
  return result
}

const transform = tree => {
  const error = i.error(c.error.SYNTAX_ERROR, JSON.stringify(tree), 'transform')

  if (tree.length === 0) return error

  if (tree.length === 1) {
    if (typeof tree[0] !== 'string') return error

    if (tree[0].length > 0 && tree[0][0] === QUOTE) {
      return {
        Z1K1: c.STRING,
        Z6K1: tree[0].slice(1, tree[0].length - 1)
      }
    } else {
      if (tree[0] === '[]') {
        return {
          Z1K1: c.REFERENCE,
          Z9K1: 'Z13'
        }
      } else {
        return {
          Z1K1: c.REFERENCE,
          Z9K1: tree[0]
        }
      }
    }
  }

  if (tree[0] === undefined) return error
  if (tree[0].length > 0 && tree[0][0] === QUOTE) {
    var result = {
      Z1K1: c.STRING,
      Z6K1: tree[0].slice(1, tree[0].length - 1)
    }
  } else {
    result = {
      Z1K1: c.REFERENCE,
      Z9K1: tree[0]
    }
  }
  for (let n = 1; n < tree.length; n++) {
    if (!Array.isArray(tree[n])) return error

    let args = splitArgs(tree[n])
    if (tree[0] === ARRAY) {
      result = []
      for (let m in args) {
        result.push(args[m].argument_value)
      }
      result = i.listify(result)
    } else {
      result = {
        Z1K1: c.FUNCTION_CALL,
        Z7K1: result
      }
      for (let m in args) {
        result['K' + (1 + parseInt(m))] = args[m].argument_value
      }
    }
  }

  return result
}

const parse = (text, language) => {
  const tokens = tokenize(text)
  if (tokens[0] === c.ERROR) {
    return i.error(tokens[1], tokens[2])
  }
  u.log('tokenizer', tokens)

  const tree = root(tokens)
  if (tree.Z1K1 === c.ERROR) {
    return tree
  }
  u.log('lisper', tree.Z1K1)

  let result = transform(tree.Z1K1)
  u.log('ast', result)

  if (language !== null) {
    result = i.delabelize(result, language)
    u.log('delabelize', result)
  }

  return result
}

exports.parse = parse
