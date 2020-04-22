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
const getData = i.getData
const globalValidate = i.validate
const follow = i.follow

const memory = {}

const validate = data => {
  if (data.Z1K1 === c.ERROR) return data

  const memorize = (value) => {
    memory[data.Z9K1] = value
    return value
  }

  if (memory[data.Z9K1] !== undefined) return memory[data.Z9K1]
  memorize(data)

  const referenced = getData(data.Z9K1)
  if (referenced.Z1K1 === c.ERROR) {
    return memorize(i.error(c.error.ERROR_IN_REFERENCE, referenced))
  }

  const followed = follow(data)
  if (followed.Z1K1 === c.ERROR) {
    return memorize(followed)
  }

  const result = globalValidate(followed)
  if (result.Z1K1 === c.ERROR) {
    return memorize(i.error(c.error.ERROR_IN_REFERENCE, result))
  }

  return memorize(data)
}

exports.validate = validate
