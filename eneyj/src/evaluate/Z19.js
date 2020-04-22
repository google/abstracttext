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

const alpha = (data, variableName, guid) => {
  if (data.Z1K1 !== c.BUILTIN) return data
  return data
}

const beta = (data, variableName, guid, value) => {
  if (data.Z1K1 !== c.BUILTIN) return data

  let context = data.context
  if (context === undefined) {
    context = []
  }
  context.push({
    argument_name: variableName,
    argument_value: value
  })

  return {
    Z1K1: c.BUILTIN,
    Z1K2: data.Z1K2,
    context: context
  }
}

const builtins = {}

const evaluate = (data) => {
  if (data.Z1K1 !== c.BUILTIN) return data
  if (builtins[data.Z1K2] === undefined) {
    builtins[data.Z1K2] = require('./../builtin/' + data.Z1K2 + '.js').builtin
  }
  return builtins[data.Z1K2](data.context)
}

exports.alpha = alpha
exports.beta = beta
exports.evaluate = evaluate
