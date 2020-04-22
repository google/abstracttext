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
const globalAlpha = i.alpha
const globalBeta = i.beta
const globalEvaluate = i.evaluate

const alpha = (data, variableName, guid) => {
  if (data.Z1K1 !== c.MULTILINGUAL_TEXT) return data

  return {
    Z1K1: c.MULTILINGUAL_TEXT,
    Z1K2: data.Z1K2,
    Z12K1: globalAlpha(data.Z12K1, variableName, guid)
  }
}

const beta = (data, variableName, guid, value) => {
  if (data.Z1K1 !== c.MULTILINGUAL_TEXT) return data

  return {
    Z1K1: c.MULTILINGUAL_TEXT,
    Z12K1: globalBeta(data.Z12K1, variableName, guid, value)
  }
}

const evaluate = data => {
  if (data.Z1K1 !== c.MULTILINGUAL_TEXT) return data

  return {
    Z1K1: c.MULTILINGUAL_TEXT,
    Z1K2: data.Z1K2,
    Z12K1: globalEvaluate(data.Z12K1)
  }
}

exports.alpha = alpha
exports.beta = beta
exports.evaluate = evaluate
