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

const u = require('./../index.js').utils
const datapath = u.config('datapath')

let filename = ''

fs.readdir(datapath, (err, files) => {
  if (err) {
    console.log(err.stack)
  }
  for (filename of files) {
    if (filename === 'B2.json') continue
    const content = require(datapath + filename)
    const oldstring = JSON.stringify(content, null, 2)
    act(content)
    const newstring = JSON.stringify(content, null, 2)
    if (oldstring !== newstring) {
      console.log(filename, 'changed.')
      fs.writeFileSync(datapath + filename, newstring)
    }
  }
})

const act = data => {
  if (typeof data !== 'object') return data

  if (data.Z1K1 === 'Z20') {
    data.Z20K2.Z1K1 = 'Z21'
  }

  for (let k in data) {
    // Type 1: 571 -> 245 -> 10 -> 0
    // if (k[0] !== 'Z' && k[0] !== 'K') console.log(filename + ': ' + k)
    if (typeof data[k] === 'string') {
      if (k === 'Z6K1') continue
      // if (k === 'Z180K1') {
      //  data[k] = { Z1K1: 'Z6', 'Z6K1': data[k] }
      // }
      if (['Z11K2', 'Z16K1', 'Z16K2', 'Z70K1', 'Z60K1'].includes(k)) {
        // Type 2: 0 (reports 4 false positives)
        // if (data[k][0] === 'K') console.log(filename + ': ' + k + ' ' + data[k])
        continue
      }
      // Type 3: 705 -> 457 -> 340 -> 65 -> 16
      // if (!['Z', 'B', 'K', 'Q'].includes(data[k][0])) console.log(filename + ': ' + k + ' ' + data[k])
      continue
    } else if (Array.isArray(data[k])) data[k] = data[k].map(act)
    else data[k] = act(data[k])
  }
  return data
}
