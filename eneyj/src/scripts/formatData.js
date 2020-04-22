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

const i = require('../index.js')
const u = i.utils

const path = u.config('datapath')

const sortkeys = obj => {
  if (Array.isArray(obj)) return obj.map(sortkeys)
  if (typeof obj !== 'object') return obj
  for (const key in obj) {
    if (!u.iszkid(key) && !u.iskid(key)) {
      console.log('Bad key', key)
      process.exit(1)
    }
  }
  const keys = Object.keys(obj).sort(u.sortzkids)
  const sortedobj = {}
  for (const key of keys) {
    sortedobj[key] = sortkeys(obj[key])
  }
  return sortedobj
}

fs.readdir(path, (err, files) => {
  if (err) {
    console.log(err.stack)
  }
  for (let filename of files) {
    if (filename === 'B2.json') continue
    const content = require(path + filename)
    const canonical = i.canonicalize(content)
    const sortedcontent = sortkeys(canonical)
    const contentstring = JSON.stringify(sortedcontent, null, 2)
    fs.writeFileSync(path + filename, contentstring)
  }
})
