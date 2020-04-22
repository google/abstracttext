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

const i = require('./../index.js')
const c = i.constants

const error = (code, data1, data2) => {
  return {
    Z1K1: c.ERROR,
    Z5K1: {
      Z1K1: c.REFERENCE,
      Z9K1: code
    },
    Z5K2: data1 || undefined,
    Z5K3: data2 || undefined
  }
}

const listify = data => {
  if (data.length === 0) {
    return {
      Z1K1: c.REFERENCE,
      Z9K1: 'Z13'
    }
  }
  return {
    Z1K1: c.LIST,
    Z10K1: data[0],
    Z10K2: listify(data.slice(1))
  }
}

const delistify = data => {
  if (data.Z1K1 !== c.LIST) {
    return error(c.error.LIST_TYPE_MISMATCH, data.Z1K1)
  }

  const result = []
  let cursor = data
  while (cursor.Z1K1 === c.LIST) {
    result.push(cursor.Z10K1)
    cursor = cursor.Z10K2
  }
  return result
}

const isObjectOrArray = data => Array.isArray(data) || typeof data === 'object'

const isReference = str => /^[ZB][1-9][0-9]*$/.test(str)

const expand = data => {
  if (Array.isArray(data)) data = listify(data)
  if (!isObjectOrArray(data)) {
    if (typeof data !== 'string') {
      return error(
        c.error.ZOBJECTS_ONLY_ALLOW_STRINGS_AND_OBJECTS, data, 'json.expand')
    }
    if (isReference(data)) {
      return {
        Z1K1: c.REFERENCE,
        Z9K1: data
      }
    }
    return {
      Z1K1: c.STRING,
      Z6K1: data
    }
  }
  if (data.Z1K1 === c.ERROR) return data
  for (let k in data) {
    if (typeof data[k] !== 'string' && !isObjectOrArray(data[k])) {
      return error(
        c.error.ZOBJECTS_ONLY_ALLOW_STRINGS_AND_OBJECTS, k, 'json.expand')
    }
    if (i.stableKeys.includes(k)) {
      continue
    } else if (isObjectOrArray(data[k])) {
      data[k] = expand(data[k])
    } else if (isReference(data[k])) {
      if (k === 'Z9K1') continue
      data[k] = {
        Z1K1: c.REFERENCE,
        Z9K1: data[k]
      }
    } else {
      data[k] = {
        'Z1K1': 'Z6',
        'Z6K1': data[k]
      }
    }
  }
  return data
}

const canonicalize = data => {
  if (Array.isArray(data)) return data.map(canonicalize)
  if (!isObjectOrArray(data)) { return data }
  const result = {}
  for (let k in data) {
    if (isObjectOrArray(data[k])) {
      result[k] = canonicalize(data[k])
    } else {
      result[k] = data[k]
    }
  }
  if (result.Z1K1 === 'Z6') {
    const keys = Object.keys(result)
    if (keys.length !== 2) return result
    if (result.Z6K1 === undefined) return result
    if (isReference(result.Z6K1)) return result
    return result.Z6K1
  }
  if (result.Z1K1 === 'Z9') {
    const keys = Object.keys(result)
    if (keys.length !== 2) return result
    if (result.Z9K1 === undefined) return result
    if (!isReference(result.Z9K1)) return result
    return result.Z9K1
  }
  if (result.Z1K1 === 'Z10') {
    const keys = Object.keys(result)
    if (keys.length !== 3) return result
    if (result.Z10K1 === undefined) return result
    if (result.Z10K2 === undefined) return result
    if (isObjectOrArray(result.Z10K1) && isObjectOrArray(result.Z10K2) &&
        result.Z10K1.Z1K1 === c.EXCEPTION && result.Z10K2.Z1K1 === c.EXCEPTION &&
        result.Z10K2.Z1K2 === 'Z441' && result.Z10K2.Z1K2 === 'Z441') {
      return []
    }
    if (result.Z10K2 === 'Z13') {
      return [result.Z10K1]
    }
    if (Array.isArray(result.Z10K2)) {
      return [result.Z10K1].concat(result.Z10K2)
    }
    return result
  }
  return result
}

exports.listify = listify
exports.delistify = delistify
exports.expand = expand
exports.canonicalize = canonicalize
exports.error = error
