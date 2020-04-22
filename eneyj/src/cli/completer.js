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

const i = require('../index.js')
const c = i.constants
const u = i.utils

const allLabels = u.allLabels()

const completer = settings => line => {
  const commands = require('./commands.js').commands
  const commandnames = []
  for (const command of commands) {
    commandnames.push('.' + command.replname)
  }
  const lang = settings.parselang === null ? c.NOTHING : settings.parselang
  const completions = commandnames.concat(allLabels[lang])
  const pieces = line.split(/[\s,@\-+*^#='$:;→\\/λ<>()"{}[\]]/)
  const last = pieces[pieces.length - 1]
  const start = line.slice(0, line.length - last.length)
  const hits = completions.filter(c => c.startsWith(last)).map(c => start + c)
  // show all completions if none found
  return [hits.length ? hits : completions, line]
}

exports.completer = completer
