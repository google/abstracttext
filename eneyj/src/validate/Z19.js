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

const fileExists = {}

const validate = data => {
  if (data.Z1K1 === c.ERROR) return data

  const filepath = path.join(__dirname, '..', 'builtin', data.Z1K2 + '.js')

  if (fileExists[filepath] === undefined) {
    fileExists[filepath] = fs.existsSync(filepath)
  }

  if (fileExists[filepath]) return data

  return i.error(c.error.UNKNOWN_BUILTIN, data.Z1K2)
}

exports.validate = validate
