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
// builtin: everything

const i = require('./../index.js')
const c = i.constants
const u = i.utils
const listify = i.listify
const fs = require('fs')

const listEverything = () => {
  let list = fs.readdirSync(u.config('datapath'))
  list = list.map(n => n.slice(0, -5))
  list = list.filter(n => n[0] === 'Z')
  // TODO: that is too many exceptions!
  list = list.filter(
    n => (['Z24', 'Z13', 'Z441', 'Z443'].indexOf(n) < 0)
  ).sort(u.sortzkids)
  list = list.map(n => {
    return {
      Z1K1: c.REFERENCE,
      Z9K1: n
    }
  })
  return list
}

const builtin = context => {
  u.log('builtin:everything', context)
  return listify(listEverything())
}

exports.builtin = builtin
