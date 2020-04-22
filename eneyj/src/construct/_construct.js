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

const constructors = {}

const construct = (data, context) => {
  const functionToCall = i.evaluate(data.Z7K1, context)

  if (functionToCall.Z4K2 === undefined) {
    return i.error(c.error.NO_CONSTRUCTOR, functionToCall.Z1K2)
  }

  const keys = i.delistify(functionToCall.Z4K2)
  const callLength = Object.keys(data).length - 2

  if (keys.length !== callLength) {
    return i.error(c.error.ARITY_MISMATCH, [keys.length, callLength])
  }

  const typename = functionToCall.Z4K1

  const constructor = u.load(constructors, __dirname, typename.Z9K1)
  if (constructor !== null) {
    // TODO the code in this conditional should go once all constructors
    // are internalized
    for (let argument in data) {
      if (u.zid(argument) === c.OBJECT) continue
      if (u.zid(argument) === c.FUNCTION_CALL) continue
      let stringData = i.evaluate(data[argument])
      if (stringData.Z1K1 === c.STRING) {
        const text = stringData.Z6K1
        const result = constructor.construct(text)
        return i.validate(result)
      }
    }
  }

  const result = {
    Z1K1: functionToCall.Z1K2
  }

  for (let n = 0; n < keys.length; n++) {
    const kid = 'K' + (n + 1)
    const zkid = result.Z1K1 + kid
    const value = i.evaluate(data[kid])
    if (value.Z1K2 === c.NOTHING) continue
    result[zkid] = value
  }
  return i.validate(result)
}

exports.construct = construct
