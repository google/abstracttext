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

const i = require('./../index.js')
const u = i.utils
const languages = i.constants.language
const expand = i.expand

let argRest = 2

let missing = false
let dryRun = false
let chosenLanguage = null
let error = false

while (process.argv[argRest] !== undefined) {
  let unknownArg = true
  if (process.argv[argRest] === '--dryrun') {
    dryRun = true
    unknownArg = false
  }
  if (process.argv[argRest] === '--missing') {
    missing = true
    unknownArg = false
  }
  if (process.argv[argRest].startsWith('--lang:')) {
    const lang = process.argv[argRest].slice(7)
    if (!u.islanguage(lang)) {
      console.log('ERROR - Unknown language: ' + lang)
      process.exit(1)
    }
    chosenLanguage = lang
    unknownArg = false
  }
  if (unknownArg) {
    console.log('ERROR - Unknown argument: ' + process.argv[argRest])
    process.exit(1)
  }
  argRest++
}

const map = {}
for (let language in languages) {
  map[languages[language]] = {}
}

fs.readdir(u.config('datapath'), (err, files) => {
  if (err) {
    console.log(err.stack)
  }
  for (let filename of files) {
    if (filename === 'B2.json') continue
    const content = expand(require(u.config('datapath') + filename))
    for (let language in languages) {
      const l = languages[language]
      const name = u.label(content, l)
      if (u.iszid(name) && name !== content.Z1K2) {
        console.log('ERROR - Labels must not be ZIDs: ' + name +
                    ' is on ' + content.Z1K2 + ' in ' + l)
        error = true
        if (missing) {
          console.log('No further missing labels are being displayed.')
          missing = false
        }
      }
      if (name === undefined) continue
      if (content.Z1K2 === undefined) continue
      if (map[l][name] !== undefined) {
        console.log('ERROR - Label is doubled: ' + name + ' is on both ' +
                    map[l][name] + ' and ' + content.Z1K2 + ' in ' + l)
        error = true
        if (missing) {
          console.log('No further missing labels are being displayed.')
          missing = false
        }
      }
      map[l][name] = content.Z1K2
      if (u.iszid(name) && missing) {
        if (chosenLanguage === null || chosenLanguage === l) {
          console.log('Missing label' +
                      (chosenLanguage ? '' : ' for ' + l) + ': ' +
                      name)
        }
      }
    }
  }
  const resultString = JSON.stringify(map, null, 2)
  if (error) process.exit(1)
  if (dryRun) process.exit()
  fs.writeFileSync(u.config('configpath') + 'labelMap.json', resultString)
})
