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
const readline = require('readline')

const u = require('./../index.js').utils
const datapath = u.config('datapath')

// load all Z names
const filenames = fs.readdirSync(datapath)
const exists = {}
for (let filename of filenames) {
  if (filename[0] !== 'Z') continue
  const stats = fs.statSync(datapath + filename)
  exists[filename.slice(0, -5)] = stats.mtime.toISOString()
}
const lineReader = readline.createInterface({
  input: fs.createReadStream(datapath + 'backup.xml')
})

const xmlentities = {
  '&quot;': '"',
  '&gt;': '>',
  '&lt;': '<',
  '&apos;': '\'',
  '&amp;': '&'
}

let pagecount = 0
let title = ''
let timestamp = ''
let text = ''
let reading = false

lineReader.on('line', function (line) {
  if (reading) {
    if (line.endsWith('</text>')) {
      text += '\n' + line.slice(0, -7)
      reading = false
      return
    }
    text += '\n' + line
    return
  }
  if (line.trim() === '<page>') {
    pagecount += 1
  }
  if (line.trim().startsWith('<title>')) {
    title = line.trim().slice(7, -8)
  }
  if (line.trim().startsWith('<ns>')) {
    if (line.trim() === '<ns>78</ns>') {
      title = title.slice(2)
    } else {
      title = ''
    }
  }
  if (line.trim().startsWith('<timestamp>')) {
    timestamp = line.trim().slice(11, -12)
  }
  if (line.trim().startsWith('<text ')) {
    reading = true
    text = '{'
  }
  if (line.trim() === '</page>') {
    if (title === '') return
    if (timestamp < exists[title]) {
      console.log(title, 'is more recent in files.')
      return
    }
    console.log(title, 'is more recent on Wiki. Updating.')
    for (let xmlentity in xmlentities) {
      text = text.split(xmlentity).join(xmlentities[xmlentity])
    }
    const json = JSON.parse(text)
    const contentstring = JSON.stringify(json, null, 2)
    fs.writeFileSync(datapath + title + '.json', contentstring)

    title = ''
    timestamp = ''
    text = ''
  }
  if (line.trim() === '</mediawiki>') {
    console.log('Pagecount: ', pagecount)
  }
})
