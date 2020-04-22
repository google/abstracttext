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

const alpha = (data, variableName, guid) => {
  if (data.Z1K1 !== c.ARGUMENT) return data
  if (data.guid !== undefined) return data
  if (data.Z18K1 !== variableName) return data
  return {
    Z1K1: c.ARGUMENT,
    Z18K1: variableName,
    guid: guid
  }
}

const beta = (data, variableName, guid, value) => {
  if (data.Z1K1 !== c.ARGUMENT) return data
  if (data.Z18K1 !== variableName) return data
  if (data.guid !== guid) return data
  return value
}

exports.alpha = alpha
exports.beta = beta
