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

let calibrationMap

const getCalibratedImplementation = functionName => {
  if (calibrationMap === undefined) {
    calibrationMap = require('./../../config/calibration.json')
  }
  if (calibrationMap[functionName] === undefined) { return undefined }
  return calibrationMap[functionName]
}

const findImplementationIndex = data => {
  if (data.Z1K2 === undefined) return 0
  const best = getCalibratedImplementation(data.Z1K2)
  if (best === undefined) return 0
  for (let n in i.delistify(data.Z8K4)) {
    if (i.delistify(data.Z8K4)[n].Z1K2 === best) { return n }
  }
  return 0
}

exports.findImplementationIndex = findImplementationIndex
