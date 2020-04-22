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
const globalAlpha = i.alpha
const globalBeta = i.beta
const construct = i.construct

const alpha = (data, variableName, guid) => {
  if (data.Z1K1 !== c.FUNCTION_CALL) return data

  const retval = {
    Z1K1: c.FUNCTION_CALL,
    Z1K2: data.Z1K2,
    Z7K1: globalAlpha(data.Z7K1, variableName, guid)
  }
  for (let argument in data) {
    if (u.zid(argument) === c.OBJECT) continue
    if (u.zid(argument) === c.FUNCTION_CALL) continue
    retval[argument] = globalAlpha(data[argument], variableName, guid)
  }
  return retval
}

const beta = (data, variableName, guid, value) => {
  if (data.Z1K1 !== c.FUNCTION_CALL) return data

  const retval = {
    Z1K1: c.FUNCTION_CALL,
    Z7K1: globalBeta(data.Z7K1, variableName, guid, value)
  }
  for (let argument in data) {
    if (u.zid(argument) === c.OBJECT) continue
    if (u.zid(argument) === c.FUNCTION_CALL) continue
    retval[argument] = globalBeta(data[argument], variableName, guid, value)
  }
  return retval
}

const evaluate = data => {
  if (data.Z1K1 !== c.FUNCTION_CALL) return data

  const fun = i.pretransform(data)
  let f = globalAlpha(fun)
  if (f.Z1K1 === c.ERROR) return f

  if (f.Z1K1 === c.TYPE) {
    return construct(data)
  }

  if (f.Z8K1 === undefined) return f

  let calledArguments = {}
  for (let argument in data) {
    if (u.zid(argument) === c.OBJECT) continue
    if (u.zid(argument) === c.FUNCTION_CALL) continue
    if (argument[0] === 'K') {
      const pos = parseInt(argument.slice(1)) - 1
      if (pos >= i.delistify(f.Z8K1).length) continue
      calledArguments[i.delistify(f.Z8K1)[pos].Z1K2] = argument
    } else {
      calledArguments[argument] = argument
    }
  }

  let unboundArguments = []
  for (let declared of i.delistify(f.Z8K1)) {
    if (calledArguments[declared.Z1K2] !== undefined) {
      f = globalBeta(
        f, declared.Z1K2, declared.guid, data[calledArguments[declared.Z1K2]])
    } else {
      unboundArguments.push(declared)
    }
  }

  if (unboundArguments.length !== 0) {
    return {
      Z1K1: c.FUNCTION,
      Z8K1: i.listify(unboundArguments),
      Z8K2: fun.Z8K2,
      Z8K4: i.listify([{
        Z1K1: c.IMPLEMENTATION,
        Z1K2: 'C1',
        Z14K1: f
      }]) // TODO several implementations
    }
  }

  return f
}

exports.alpha = alpha
exports.beta = beta
exports.evaluate = evaluate
