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

const guid = require('uuid').v4
const fs = require('fs')
const path = require('path')
const debug = require('debug')
const util = require('util')

const i = require('./../index.js')
const c = i.constants

const utils = {}

utils.debug = debug('eneyj:debug')
utils.debug.log = console.log.bind(console)
utils.guid = guid

const functionCallLogInternal = debug('eneyj:log:function_call')
functionCallLogInternal.log = console.log.bind(console)
utils.function_call_log = (data, context) => {
  functionCallLogInternal(utils.write(data))
  functionCallLogInternal(writeContext(context))
}

utils.islanguage = lang => {
  for (let l in c.language) {
    if (c.language[l] === lang) return true
  }
  return false
}

utils.iszid = id => /^Z[1-9][0-9]*$/.test(id)

utils.iszkid = id => /^Z[1-9][0-9]*K[1-9][0-9]*$/.test(id)

utils.iskid = id => /^K[1-9][0-9]*$/.test(id)

utils.zid = id => {
  if (id[0] !== 'Z') return id
  if (id.indexOf('K') === -1) {
    return id
  }
  return id.slice(0, id.indexOf('K'))
}

utils.kid = id => {
  if (id[0] !== 'Z') return id
  if (id.indexOf('K') === -1) {
    return id
  }
  return id.slice(id.indexOf('K'))
}

utils.label = (data, language) => {
  const id = data.Z1K2
  if (data.Z1K3 === undefined) return id
  if (data.Z1K3.Z12K1 === undefined) return id
  let list = data.Z1K3.Z12K1
  if (!Array.isArray(list)) {
    list = i.delistify(list)
    if (!Array.isArray(list)) return id
  }
  const languagelist = [language].concat(c.languagefallbacks[language])
  for (let l of languagelist) {
    if (l === undefined) continue
    for (let label of list) {
      if (label.Z11K1 === undefined) continue
      if (label.Z11K1.Z9K1 !== l) continue
      if (label.Z11K2 === undefined) return id
      return label.Z11K2 // TODO evaluate?
    }
  }
  return id
}

const idlabels = {}

utils.idlabel = (id, language) => {
  if (idlabels[language] === undefined) idlabels[language] = {}
  if (idlabels[language][id] !== undefined) return idlabels[language][id]
  if (utils.iszid(id)) {
    const data = i.getData(id)
    idlabels[language][id] = utils.label(data, language)
    return idlabels[language][id]
  }
  if (id === utils.zid(id) + utils.kid(id)) {
    const data = i.getData(utils.zid(id))
    var list = []
    if (data.Z1K1 === c.TYPE) list = i.delistify(data.Z4K2)
    if (data.Z1K1 === c.FUNCTION) list = i.delistify(data.Z8K1)
    if (!Array.isArray(list)) return id
    for (let definition of list) {
      if (definition.Z1K2 === id) {
        idlabels[language][id] = utils.label(definition, language)
        return idlabels[language][id]
      }
    }
    return id
  }
  return id
}

let labelMap

utils.delabel = (label, language) => {
  if (labelMap === undefined) {
    labelMap = require('./../../config/labelMap.json')
  }
  if (labelMap[language] === undefined) return label
  if (labelMap[language][label] === undefined) return label
  return labelMap[language][label]
}

utils.allLabels = () => {
  if (labelMap === undefined) {
    labelMap = require('./../../config/labelMap.json')
  }
  const allLabels = {}
  allLabels[c.NOTHING] = Object.values(labelMap[c.language.EN])
  for (const language of Object.keys(labelMap)) {
    allLabels[language] = Object.keys(labelMap[language])
  }
  return allLabels
}

const loggers = {}
utils.log = (channel, message) => {
  if (!(channel in loggers)) {
    loggers[channel] = debug('eneyj:log:' + channel)
    loggers[channel].log = console.log.bind(console)
  }
  loggers[channel](message)
}

utils.enable_all_logs = () => {
  util.inspect.defaultOptions.depth = 9
  debug.enable('eneyj:log:*')
}

utils.enable_debug = () => {
  util.inspect.defaultOptions.depth = 9
  debug.enable('eneyj:debug,eneyj:log:*')
}

utils.load = (cache, dir, name) => {
  if (cache[name] === undefined) {
    const filepath = path.join(dir, name + '.js')
    if (fs.existsSync(filepath)) {
      cache[name] = require(filepath)
    } else {
      cache[name] = null
    }
  }
  return cache[name]
}

let configs = {}
const configpath = path.join(__dirname, '..', '..', 'config/')
if (!fs.existsSync(configpath + 'config.json')) {
  configs = {
    configpath: configpath,
    datapath: path.join(__dirname, '..', '..', 'data/')
  }
} else {
  configs = require(configpath + 'config.json')
}

utils.config = key => {
  return configs[key]
}
i.setDataSourceFile(utils.config('datapath'))

utils.color_json_console = data => {
  let text = JSON.stringify(data, undefined, 2)

  return text.replace(/("(\\u[A-Za-z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g,
    match => {
      let color = '\x1b[36m'
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          color = '\x1b[91m' // keys, red
        } else {
          color = '\x1b[92m' // values, green
        }
      }
      return color + match + '\x1b[0m'
    }
  )
}

const znumber = id => {
  if (id[0] !== 'Z') return Infinity
  if (id.indexOf('K') === -1) {
    return parseInt(id.slice(1))
  }
  return parseInt(id.slice(1, id.indexOf('K')))
}

const knumber = id => {
  if (id.indexOf('K') === -1) {
    return Infinity
  }
  return parseInt(id.slice(id.indexOf('K') + 1))
}

utils.sortzkids = (left, right) => {
  if (znumber(left) === znumber(right)) {
    if (knumber(left) === knumber(right)) {
      return left < right
    }
    return knumber(left) - knumber(right)
  }
  return znumber(left) - znumber(right)
}

const endOfList = arg => {
  if (arg === 'Z13') return true
  if (arg === 'Z441') return true
  if (arg.Z1K2 === 'Z13') return true
  if (arg.Z1K1 === c.EXCEPTION) {
    if (arg.Z1K2 === 'Z441') return true
    if (arg.Z1K2 === 'Z443') return true // TODO: this is a copout and wrong
    // features_from_table should return an empty list instead of an Z443
    // which means all tables should just be empty lists on Z200K5 instead of
    // undefined
  }
  if (arg.Z1K1 === c.REFERENCE) {
    if (arg.Z9K1 === 'Z13') return true
  }
  return false
}

const writeList = (arg, labeler) => {
  if (arg.Z1K1 === 'Z7') { return utils.write(arg, labeler) }
  // TODO: might the above line be wrong? Should Z7 have been evaled by here?
  if (arg.Z10K1 === 'Z441' || arg.Z10K1.Z1K2 === 'Z441' || arg.Z10K1.Z9K1 === 'Z441') {
    return ']'
  }
  if (endOfList(arg.Z10K2)) {
    return utils.write(arg.Z10K1, labeler) + ']'
  }
  return utils.write(arg.Z10K1, labeler) + ', ' + writeList(arg.Z10K2, labeler)
}

const properKeys = arg => {
  const keys = Object.keys(arg).sort(utils.sortzkids)
  // const outliers = keys.filter(key => !key.startsWith('Z'))
  // if (outliers.length > 0) console.log(outliers)
  return keys.filter(key => !key.startsWith('Z1K') && (key.startsWith('Z') || key.startsWith('K')))
}

utils.escapeString = s => {
  let res = ''
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\n') {
      res += '\\n'
      continue
    }
    if (s[i] === '\\') {
      res += '\\'
    }
    if (s[i] === '"') {
      res += '\\'
    }
    res += s[i]
  }
  return '"' + res + '"'
}

utils.unescapeString = s => {
  const error = i.error(c.error.INVALID_STRING_LITERAL, s)
  if (s.length < 2) return error
  if (s[0] !== '"') return error
  if (s[s.length - 1] !== '"') return error
  let res = ''
  for (let i = 0; i < s.length; i++) {
    if (i === 0) continue
    if (i === s.length - 1) continue
    if (s[i] === '"') return error
    if (s[i] === '\\') {
      if (i + 2 === s.length) return error
      if (s[i + 1] === '"') {
        i += 1
        res += s[i]
        continue
      }
      if (s[i + 1] === 'n') {
        i += 1
        res += '\n'
        continue
      }
      if (s[i + 1] === '\\') {
        i += 1
        res += s[i]
        continue
      }
      return error
    }
    res += s[i]
  }
  return res
}

utils.write = (arg, labeler) => {
  if (labeler === undefined) { labeler = l => l }

  // native string
  if (typeof arg === 'string') return utils.escapeString(arg)

  // native array
  if (Array.isArray(arg)) return utils.write(i.listify(arg), labeler)

  // id
  if (arg.Z1K2 !== undefined) return labeler(arg.Z1K2)

  // reference
  if (arg.Z1K1 === c.REFERENCE) return labeler(arg.Z9K1)

  // string
  if (arg.Z1K1 === c.STRING) return utils.escapeString(arg.Z6K1)

  // array
  if (arg.Z1K1 === c.LIST) return '[' + writeList(arg, labeler)

  const proper = properKeys(arg)

  // function call
  if (arg.Z1K1 === c.FUNCTION_CALL) {
    let result = utils.write(arg.Z7K1, labeler)
    result += '('
    let first = true
    for (const key of proper) {
      if (key.startsWith('Z7K')) continue
      if (!first) result += ', '
      result += utils.write(arg[key], labeler)
      first = false
    }
    result += ')'
    return result
  }

  // symbol, id
  if (proper.length === 0) {
    // TODO one shouldn't get here, but whatever
    return JSON.stringify(arg, null, 2)
  }

  // fall back
  let result = labeler(arg.Z1K1)
  result += '('
  let first = true
  for (const key of proper) {
    if (!first) result += ', '
    // TODO: this is wrong. There should eventually never be empty values,
    // unless explicitly given.
    if (arg[key] === undefined) {
      result += utils.write({ 'Z1K1': 'Z9', 'Z9K1': 'Z23' }, labeler)
    } else {
      result += utils.write(arg[key], labeler)
    }
    first = false
  }
  result += ')'
  return result
}

const writeContext = context => context.map(
  t => t.argument_name + ': ' + utils.write(t.argument_value)
)

exports.utils = utils
