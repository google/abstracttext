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

const readline = require('historic-readline')

const u = require('../index.js').utils

const completer = require('./completer.js').completer
const answer = require('./answer.js').answer
const command = require('./commands.js').command

const interactive = settings => {
  console.log('eneyj v0.1.0')
  if (settings.parselang === null && settings.labellang === null) {
    settings.parselang = 'Z251'
    settings.labellang = 'Z251'
  }
  console.log('language is set to ' +
              u.idlabel(settings.parselang, settings.labellang))
  console.log('Enter .help for help')

  readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
    path: u.config('configpath') + 'history',
    completer: completer(settings),
    historySize: 5000,
    removeHistoryDuplicates: true,
    next: rl => {
      rl.on('line', line => {
        line = line.trim()
        if (line[0] === '.') {
          command(line, settings, rl)
        } else if (line.length > 0) {
          const call = line.trim()
          answer(call, settings)
        }
        console.log('')
        rl.prompt()
      })

      rl.on('close', () => {
        console.log('Have a great day!')
        process.exit(0)
      })

      rl.prompt()
    }
  })
}

exports.interactive = interactive
