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
const u = i.utils
const evaluate = i.evaluate
const parse = i.parse

const readLanguage = input => {
  const result = evaluate(parse('Z189("' + input + '")'))
  if (result.Z1K1 === 'Z180') { return result.Z1K2 }
  console.log('ERROR - Unknown language: ' + input)
  process.exit(1)
}

const processArguments = argv => {
  let settings = {
    doEval: true,
    doValidation: true,
    doLin: true,
    doLabelize: false,
    linstring: 'Z79(Z63,Z251)',
    canonical: true,
    jsondir: false,
    color: true,
    parselang: null,
    labellang: null,
    interactive: true,
    call: null,
    logs: false,
    debug: false,
    timer: false,
    url: undefined,
    server: false
  }

  let argRest = 2

  while (argv[argRest] !== undefined && argv[argRest][0] === '-') {
    let unknownArg = true
    if (argv[argRest] === '--noeval') {
      settings.doEval = false
      unknownArg = false
    }
    if (argv[argRest] === '--novalidation') {
      settings.doValidation = false
      unknownArg = false
    }
    if (argv[argRest] === '--nolin') {
      settings.doLin = false
      unknownArg = false
    }
    if (argv[argRest] === '--labelize') {
      settings.doLabelize = true
      settings.doLin = false
      unknownArg = false
    }
    if (argv[argRest] === '--jsondir') {
      settings.jsondir = true
      unknownArg = false
    }
    if (argv[argRest] === '--nocolor') {
      settings.color = false
      unknownArg = false
    }
    if (argv[argRest] === '--help') {
      require('./helptext.js').helptext()
    }
    if (argv[argRest] === '--log') {
      settings.logs = true
      u.enable_all_logs()
      unknownArg = false
    }
    if (argv[argRest] === '--debug') {
      settings.logs = true
      settings.debug = true
      u.enable_debug()
      unknownArg = false
    }
    if (argv[argRest].startsWith('--lang:')) {
      const lang = readLanguage(argv[argRest].slice(7))
      settings.parselang = lang
      settings.labellang = lang
      unknownArg = false
    }
    if (argv[argRest].startsWith('--parselang:')) {
      settings.parselang = readLanguage(argv[argRest].slice(12))
      unknownArg = false
    }
    if (argv[argRest].startsWith('--labellang:')) {
      settings.labellang = readLanguage(argv[argRest].slice(12))
      unknownArg = false
    }
    if (argv[argRest] === '--http') {
      argRest++
      settings.url = argv[argRest]
      i.setDataSourceFile(settings.url)
      unknownArg = false
    }
    if (argv[argRest] === '--server') {
      settings.server = true
      unknownArg = false
    }
    if (unknownArg) {
      console.log('ERROR - Unknown argument: ' + argv[argRest])
      process.exit(1)
    }
    argRest++
    if (argRest >= argv.length) break
  }

  if (argRest >= argv.length) {
    settings.interactive = true
  } else {
    settings.interactive = false
    settings.call = argv.slice(argRest).join(' ')
  }

  return settings
}

exports.settings = processArguments
