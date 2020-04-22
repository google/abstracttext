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

const follow = data => {
  if (data.Z1K1 !== c.REFERENCE) return data

  const visited = new Set()
  while (data.Z1K1 === c.REFERENCE) {
    if (visited.has(data.Z1K2)) {
      return i.error(c.error.CYCLIC_REFERENCE, visited)
    }
    visited.add(data.Z1K2)
    data = getData(data.Z9K1)
  }

  return data
}

exports.follow = follow
