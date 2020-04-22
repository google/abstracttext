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
const u = i.utils

const labelize = (data, language) => {
  if (language === undefined || language === null) return data

  if (typeof data === 'string') return u.idlabel(data, language)

  const langlabelize = data => labelize(data, language)
  if (Array.isArray(data)) return data.map(langlabelize)

  if (typeof data !== 'object') return data

  let retval = {}
  for (let key in data) {
    const keylabel = u.idlabel(key, language)
    retval[keylabel] = labelize(data[key], language)
  }
  return retval
}

const delabelize = (data, language) => {
  if (language === undefined || language === null) return data

  if (typeof data === 'string') return u.delabel(data, language)

  const langdelabelize = data => delabelize(data, language)
  if (Array.isArray(data)) return data.map(langdelabelize)

  if (typeof data !== 'object') return data

  let retval = {}
  for (let key in data) {
    const keylabel = u.delabel(key, language)
    if (keylabel === 'Z6K1') {
      retval[keylabel] = data[key]
    } else {
      retval[keylabel] = delabelize(data[key], language)
    }
  }
  return retval
}

exports.labelize = labelize
exports.delabelize = delabelize
