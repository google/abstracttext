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

const safeStringify = require('json-stringify-safe')

const i = require('./../index.js')
const u = i.utils
const c = i.constants

let memory = {}

const forgetAll = () => { memory = {} }

const evaluators = {}

const kee = d => {
  try {
    return JSON.stringify(d)
  } catch (error) {
    return safeStringify(d)
  }
}

const evaluate = (data) => {
  let dKey = data.Z1K2 ? data.Z1K2 : u.write(data)
  if (dKey === undefined) dKey = kee(data)
  if (memory[dKey] !== undefined) return memory[dKey]
  const memorize = (value) => {
    if (typeof value === 'object') memory[dKey] = value
    return value
  }

  let stackCount = 10000
  let input = ''
  let d = data
  while (input !== kee(d)) {
    if ((stackCount--) < 0) {
      return i.error(c.error.MAXIMAL_RECURSION_DEPTH_EXCEEDED, d)
    }
    const evaluator = u.load(evaluators, __dirname, d.Z1K1)
    u.log('eval:' + d.Z1K1, u.write(data))
    if (evaluator === null) return memorize(d)
    if (evaluator.evaluate === undefined) return memorize(d)

    input = kee(d)
    d = evaluator.evaluate(d)
    if (d.Z1K1 === c.ERROR) return memorize(d)
  }

  return memorize(d)
}

const alpha = (data, variableName, guid) => {
  const evaluator = u.load(evaluators, __dirname, data.Z1K1)
  u.log('alpha:' + data.Z1K1, u.write(data))
  if (evaluator === null) return data
  if (evaluator.alpha === undefined) return data
  return evaluator.alpha(data, variableName, guid)
}

const beta = (data, variableName, guid, value) => {
  const evaluator = u.load(evaluators, __dirname, data.Z1K1)
  u.log('beta:' + data.Z1K1, u.write(data))
  if (evaluator === null) return data
  if (evaluator.beta === undefined) return data
  return evaluator.beta(data, variableName, guid, value)
}

exports.alpha = alpha
exports.beta = beta
exports.evaluate = evaluate
exports.forgetAll = forgetAll
