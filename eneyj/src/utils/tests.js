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

const path = require('path')
const fs = require('fs')

const i = require('./../index.js')
const u = i.utils
const c = i.constants

const evaluate = i.evaluate
const write = u.write
const validate = i.validate
const parse = i.parse
const forgetAll = i.forgetAllEvaluate

const configpath = u.config('configpath')

const getRunData = functionName => {
  const filename = path.join(configpath, 'runs', functionName + '.json')
  if (fs.existsSync(filename)) return require(filename)
  return {}
}

const testImplementation = (data, testId, implementationId) => {
  var thisTest = null
  var thisImplementation = null

  for (let test of i.delistify(data.Z8K3)) {
    if (test.Z1K2 === testId) thisTest = test
  }
  for (let implementation of i.delistify(data.Z8K4)) {
    if (implementation.Z1K2 === implementationId) thisImplementation = implementation 
  }
  let call = {
        Z7K1: {
          Z1K1: c.FUNCTION,
          Z1K2: data.Z1K2,
          Z8K1: data.Z8K1,
          Z8K2: data.Z8K2,
          Z8K4: i.listify([{
            Z1K1: c.IMPLEMENTATION,
            Z1K2: thisImplementation.Z1K2,
            Z14K1: thisImplementation.Z14K1
          }])
        },
        ...thisTest.Z20K2,
        Z1K1: c.FUNCTION_CALL
  }
  call = validate(call)
  forgetAll()
  let evalStart = new Date()
  let result = evaluate(call)
  let evalTime = new Date() - evalStart
  result = write(evaluate(parse('Z36(' + write(result) + ')')))
  const expected = write(evaluate(parse('Z36(' + write(thisTest.Z20K3) + ')')))
  return {
    result: result,
    expected: expected,
    ms: evalTime,
    errors: (result === expected ? 0 : 1)
  }
}

exports.getRunData = getRunData
exports.testImplementation = testImplementation
