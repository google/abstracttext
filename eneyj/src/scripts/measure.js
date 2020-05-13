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
const os = require('os')
const path = require('path')

const i = require('./../index.js')
const u = i.utils
const c = i.constants

const evaluate = i.evaluate
const write = u.write
const validate = i.validate
const parse = i.parse

const forgetAll = i.forgetAllEvaluate

const getData = i.getData

const testImplementation = i.testImplementation

const datapath = u.config('datapath')
const configpath = u.config('configpath')

let argRest = 2

let printTime = false
let printErrors = false
let dryRun = false

let functions = []
while (process.argv[argRest] !== undefined && process.argv[argRest][0] === '-') {
  let unknownArg = true
  if (process.argv[argRest] === '--chatty') {
    printTime = true
    printErrors = true
    unknownArg = false
  }
  if (process.argv[argRest] === '--time') {
    printTime = true
    unknownArg = false
  }
  if (process.argv[argRest] === '--errors') {
    printErrors = true
    unknownArg = false
  }
  if (process.argv[argRest] === '--dryrun') {
    dryRun = true
    unknownArg = false
  }
  if (process.argv[argRest] === '--log') {
    u.enable_all_logs()
    unknownArg = false
  }
  if (process.argv[argRest] === '--debug') {
    u.enable_debug()
    unknownArg = false
  }
  if (unknownArg) {
    console.log('ERROR - Unknown argument: ' + process.argv[argRest])
    process.exit(1)
  }
  argRest++
}

if (process.argv.length > argRest) { functions = process.argv.slice(argRest) }

if (functions.length === 0) { functions = fs.readdirSync(datapath) }

const systemData = {
  arch: os.arch(),
  cpus: os.cpus().length,
  cpu_zero: os.cpus()[0].model,
  platform: os.platform(),
  os_release: os.release(),
  os_type: os.type(),
  node_version: process.version
}

if (!dryRun) {
  if (fs.existsSync(configpath + 'system.json')) {
    const storedSystemData = require(configpath + 'system.json')
    if (JSON.stringify(storedSystemData) !== JSON.stringify(systemData)) {
      console.log('The available calibration data has been collected on a')
      console.log('different system. It might be a good idea to delete all')
      console.log('calibration data.')
      console.log('Previous system:')
      console.log(storedSystemData)
      console.log('Current system:')
      console.log(systemData)
      process.exit(1)
    }
  } else {
    const systemString = JSON.stringify(systemData, null, 2)
    fs.writeFileSync(configpath + 'system.json', systemString)
  }
}

const getRunData = functionName => {
  const filename = path.join(configpath, 'runs', functionName + '.json')
  if (fs.existsSync(filename)) return require(filename)
  return {}
}

for (let f of functions) {
  if (f[0] === '_' && f[1] === '_') continue
  if (f.endsWith('.json')) f = f.slice(0, -5)

  let data = getData(f)
  const results = getRunData(f)

  if (data.Z8K3 === undefined) continue
  data = validate(data)
  if (data.Z8K3 === undefined) continue

  if (printTime) console.log(f)

  for (let test of i.delistify(data.Z8K3)) {
    if (results[test.Z1K2] === undefined) results[test.Z1K2] = {}
    for (let implementation of i.delistify(data.Z8K4)) {
      if (results[test.Z1K2][implementation.Z1K2] === undefined) {
        results[test.Z1K2][implementation.Z1K2] = {
          runs: 0,
          average_ms: 0,
          errors: 0
        }
      }
      let result = testImplementation(data, test.Z1K2, implementation.Z1K2)
      const runs = results[test.Z1K2][implementation.Z1K2].runs
      const errors = results[test.Z1K2][implementation.Z1K2].errors
      const avgTime = results[test.Z1K2][implementation.Z1K2].average_ms
      results[test.Z1K2][implementation.Z1K2] = {
        runs: runs + 1,
        average_ms: parseInt(((avgTime * runs) + result.ms) / (runs + 1)),
        errors: errors + result.errors
      }
      if (printTime) {
        console.log(
          test.Z1K2 + ' ' + implementation.Z1K2 + ' ' +
          result.ms + ' ms (Ø ' + avgTime + ' ms in ' + runs + ' runs)'
        )
      }
      if (printErrors && result.errors === 1) {
        console.log(f, test.Z1K2, implementation.Z1K2)
        console.log(write(call))
        console.log('Actual  : ' + result.result)
        console.log('Expected: ' + result.expected)
        console.log()
      }
    }
  }
  const resultString = JSON.stringify(results, null, 2)
  if (dryRun) continue
  fs.writeFileSync(path.join(configpath, 'runs', f + '.json'), resultString)
}
