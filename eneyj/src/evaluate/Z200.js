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
  if (data.Z1K1 !== c.TABLE) return data

  return {
    Z1K1: c.TABLE,
    Z1K2: data.Z1K2,
    Z200K1: data.Z200K1,
    Z200K2: data.Z200K2 ? globalAlpha(data.Z200K2, variableName, guid) : undefined,
    Z200K3: data.Z200K3 ? globalAlpha(data.Z200K3, variableName, guid) : undefined,
    Z200K4: data.Z200K4 ? globalAlpha(data.Z200K4, variableName, guid) : undefined,
    Z200K5: data.Z200K5 ? globalAlpha(data.Z200K5, variableName, guid) : undefined
  }
}

const beta = (data, variableName, guid, value) => {
  if (data.Z1K1 !== c.TABLE) return data

  return {
    Z1K1: c.TABLE,
    Z200K1: data.Z200K1,
    Z200K2: data.Z200K2 ? globalBeta(data.Z200K2, variableName, guid, value) : undefined,
    Z200K3: data.Z200K3 ? globalBeta(data.Z200K3, variableName, guid, value) : undefined,
    Z200K4: data.Z200K4 ? globalBeta(data.Z200K4, variableName, guid, value) : undefined,
    Z200K5: data.Z200K5 ? globalBeta(data.Z200K5, variableName, guid, value) : undefined
  }
}

const evaluate = data => {
  if (data.Z1K1 !== c.TABLE) return data

  const K3 = data.Z200K3 ? globalEvaluate(data.Z200K3) : undefined
  if (K3 !== undefined && (K3.Z1K1 === c.EXCEPTION || K3.Z1K1 === c.ERROR)) return K3

  return JSON.parse(JSON.stringify({
    Z1K1: c.TABLE,
    Z1K2: data.Z1K2,
    Z200K1: data.Z200K1,
    Z200K2: data.Z200K2 ? globalEvaluate(data.Z200K2) : undefined,
    Z200K3: K3,
    Z200K4: data.Z200K4 ? globalEvaluate(data.Z200K4) : undefined,
    Z200K5: data.Z200K5 ? globalEvaluate(data.Z200K5) : undefined
  }))
}

exports.alpha = alpha
exports.beta = beta
exports.evaluate = evaluate
