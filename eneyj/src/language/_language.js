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
const path = require('path')

const i = require('./../index.js')
const c = i.constants

const argtypes = {}

const load = (argtype, dirname) => {
  if (argtypes[dirname] === undefined) {
    argtypes[dirname] = {}
  }
  if (argtypes[dirname][argtype] === undefined) {
    const filepath = path.join(dirname, argtype + '.js')
    if (fs.existsSync(filepath)) {
      argtypes[dirname][argtype] = require(filepath)
    } else {
      argtypes[dirname][argtype] = null
    }
  }
  return argtypes[dirname][argtype]
}

const natify = (argValue, dirname, as) => {
  const errorMessage = i.error(
    c.error.TYPE_NOT_SUPPORTED_FOR_LANGUAGE, argValue.Z1K1)

  if (argValue.Z1K1 === c.ERROR && as !== undefined && as !== c.OBJECT) {
    return argValue
  }
  let argtype = as ? load(as, dirname) : load(argValue.Z1K1, dirname)
  if (argtype === null) argtype = load('Z1', dirname)
  if (argtype === null) return errorMessage
  if (argtype.natify === undefined) return errorMessage

  return argtype.natify(argValue)
}

const denatify = (argValue, argType, dirname) => {
  const errorMessage = i.error(c.error.TYPE_NOT_SUPPORTED_FOR_LANGUAGE, argType)

  if (argType === c.ERROR) return argValue
  let argtype = load(argType, dirname)
  if (argtype === null) argtype = load('Z1', dirname)
  if (argtype === null) return errorMessage
  if (argtype.denatify === undefined) return errorMessage

  return argtype.denatify(argValue)
}

exports.natify = natify
exports.denatify = denatify
