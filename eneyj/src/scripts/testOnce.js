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
const validate = i.validate
const getData = i.getData

const testImplementation = i.testImplementation

let jsonFormat = false

let argRest = 2
while (process.argv[argRest] !== undefined && process.argv[argRest][0] === '-') {
  let unknownArg = true
  if (process.argv[argRest] === '--json') {
    jsonFormat = true
    unknownArg = false
  }
  if (unknownArg) {
    console.log('ERROR - Unknown argument: ' + process.argv[argRest])
    process.exit(1)
  }
  argRest++
}

var baseFunction;
var testId;
var implementationId;

if (process.argv.length > argRest+2) {
  [baseFunction, testId, implementationId] = process.argv.slice(argRest)
} else {
    console.log('ERROR - Missing argument(s)')
    process.exit(1)
}

let data = getData(baseFunction)
data = validate(data)

let result = testImplementation(data, testId, implementationId)
if (jsonFormat) {
  console.log(JSON.stringify(result))
} else {
  console.log('Expected: ' + result.expected + ' Result: ' + result.result)
  console.log('Elapsed time: ' + result.ms + 'ms; Errors: ' + result.errors)
}
