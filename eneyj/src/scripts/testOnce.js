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

let baseFunction = process.argv[2]
let testId = process.argv[3]
let implementationId = process.argv[4]

let data = getData(baseFunction)
data = validate(data)

let result = testImplementation(data, testId, implementationId)
console.log('Expected: ' + result.expected + ' Result: ' + result.result)
console.log('Elapsed time: ' + result.ms + 'ms; Errors: ' + result.errors)
