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
const u = i.utils

const hasArgument = data => {
  if (data.Z1K1 === c.ARGUMENT) return true

  for (let key in data) {
    if (typeof data[key] === 'object') if (hasArgument(data[key])) return true
  }
  return false
}

// Returns a boolean, wheter the function call has no arguments
const complete = data => {
  if (data.Z1K1 !== c.FUNCTION_CALL) return data

  if (hasArgument(data.Z7K1)) return false

  for (let argument in data) {
    if (u.zid(argument) === c.OBJECT) continue
    if (u.zid(argument) === c.FUNCTION_CALL) continue
    if (hasArgument(data[argument])) return false
  }

  return true
}

const pretransform = data => {
  const funPretransform = i.evaluate(data.Z7K1)
  const functionType = i.getData(funPretransform.Z1K1)
  if (functionType.Z4K6 === undefined) return funPretransform
  const pretransformCall = {
    Z1K1: 'Z7',
    Z7K1: functionType.Z4K6,
    K1: funPretransform
  }
  return i.evaluate(pretransformCall)
}

exports.complete = complete
exports.pretransform = pretransform
