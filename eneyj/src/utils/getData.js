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
const expand = i.expand
const error = i.error

let urlPath = ''
let filePath = ''
let online = false

const getDataFromFile = dataName => {
  const filename = filePath + dataName + '.json'
  const fs = require('fs')

  if (fs.existsSync(filename)) {
    try {
      var result = require(filename)
    } catch (err) {
      result = error(
        c.error.NOT_WELL_FORMED, err.message, 'utils.getDataFromFile')
    }
    return result
  } else {
    return error(c.error.NAME_DOES_NOT_EXIST, dataName, 'utils.getData')
  }
  // if (fs.existsSync(filename)) { return require('.' + filename) }
}

const getDataFromHttp = dataName => {
  const url = urlPath + dataName
  const request = require('sync-request')
  const res = request('GET', url)

  try {
    var result = JSON.parse(res.getBody())
  } catch (err) {
    result = error(
      c.error.NOT_WELL_FORMED, err.message, 'utils.getDataFromHttp')
  }
  return result
}

let memoized = {}

const checkIdAndType = (data, dataName) => {
  if (data.Z1K1 === c.ERROR) return data
  if (data.Z1K2 === undefined) {
    return error(c.error.DATA_HAS_NO_ID, data, 'utils.getData')
  }
  if (data.Z1K2 !== dataName) {
    return error(
      c.error.DATA_ID_MISMATCH,
      'Should be ' + dataName + ', is ' + data.Z1K2,
      'utils.getData'
    )
  }
  if (!/^[BZ][1-9][0-9]*$/.test(data.Z1K2)) {
    return error(c.error.INVALID_ID, data.Z1K2, 'utils.getData')
  }
  return data
}

const deepfreeze = obj => {
  for (let key in obj) {
    if (Array.isArray(obj[key])) {
      obj[key] = obj[key].map(deepfreeze)
    } else if (typeof obj[key] === 'object') {
      obj[key] = deepfreeze(obj[key])
    }
  }
  return Object.freeze(obj)
}

const getData = dataName => {
  let result
  if (memoized[dataName] !== undefined) {
    return memoized[dataName]
  }
  if (online) result = getDataFromHttp(dataName)
  result = expand(getDataFromFile(dataName))
  memoized[dataName] = checkIdAndType(deepfreeze(result), dataName)
  return memoized[dataName]
}

const forgetAll = () => {
  memoized = {}
}

const setDataSourceHttp = path => {
  urlPath = path
  online = true
}

const setDataSourceFile = path => {
  filePath = path
  online = false
}

exports.setDataSourceHttp = setDataSourceHttp
exports.setDataSourceFile = setDataSourceFile

exports.getData = getData
exports.forgetAll = forgetAll
