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

const fs = require('fs')
const path = require('path')

const i = require('./../index.js')
const c = i.constants

const alpha = (data, variableName, guid) => {
  if (data.Z1K1 !== c.CODE) return data
  return data
}

const beta = (data, variableName, guid, value) => {
  if (data.Z1K1 !== c.CODE) return data

  let context = data.context
  if (context === undefined) {
    context = []
  }
  let argtype
  if (data.argument_types !== undefined) {
    for (let argumentType of i.delistify(data.argument_types)) {
      if (variableName === argumentType.Z1K2) {
        argtype = argumentType.Z17K1.Z9K1
      }
    }
  }
  context.push({
    argument_name: variableName,
    argument_value: value,
    argument_type: argtype
  })

  return {
    Z1K1: c.CODE,
    Z16K1: data.Z16K1,
    Z16K2: data.Z16K2,
    context: context,
    argument_types: data.argument_types,
    return_type: data.return_type
  }
}

const languages = {}

const evaluate = data => {
  if (data.Z1K1 !== c.CODE) return data

  if (languages[data.Z16K1] === undefined) {
    const filepath = path.join(
      __dirname, '..', 'language', data.Z16K1, '_language.js')
    if (fs.existsSync(filepath)) {
      languages[data.Z16K1] = require(filepath)
    } else {
      languages[data.Z16K1] = null
    }
  }

  if (languages[data.Z16K1] === null) {
    return i.error(c.error.PROGRAMMING_LANGUAGE_NOT_SUPPORTED, data.Z16K1)
  }

  return languages[data.Z16K1].evaluate(data)
}

exports.alpha = alpha
exports.beta = beta
exports.evaluate = evaluate
