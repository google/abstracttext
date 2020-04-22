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

const util = require('util')

const i = require('../index.js')
const u = i.utils
const c = i.constants
const evaluate = i.evaluate
// const write = u.write
const validate = i.validate
const parse = i.parse
const labelize = i.labelize
const delabelize = i.delabelize
const canonicalize = i.canonicalize

// const getData = i.getData

const answer = (call, settings) => {
  const startTime = new Date()
  if (call[0] === '{') {
    var data = delabelize(JSON.parse(call), settings.parselang)
  } else {
    data = parse(call, settings.parselang)
  }
  const parsetime = new Date() - startTime

  const startValidation = new Date()
  if (settings.doValidation) { data = validate(data) }
  const validationtime = new Date() - startValidation

  const startEvaluation = new Date()
  if (settings.doEval) { data = evaluate(data) }
  const evaluationtime = new Date() - startEvaluation

  const startLinearization = new Date()

  if (settings.doLin) {
    const lincall = {
      Z1K1: c.FUNCTION_CALL,
      Z7K1: parse(settings.linstring),
      K1: data
    }
    data = evaluate(lincall)
    if (data.Z1K1 === c.STRING) data = data.Z6K1
  }

  /*
    console.log('\x1b[90mstart\x1b[0m')
    console.log(data)
    if (settings.doLin) {
      console.log(write(data))
      data = evaluate(parse(linstring + '(' + write(data) + ')'))
      // data = write(data, l => u.idlabel(l, settings.labellang))
      console.log('\x1b[90mlin\x1b[0m')
      console.log(data)
    }
*/

  // THE PART UNTIL HERE IS USEFUL FOR CHECKING PROBLEMS WITH LINEARIZATION
  // THE PART FROM HERE WAS THE OLD CODE THAT HAD A LOT OF JSON SERIALIZATION
  // OPTIONS, WHICH NOW I WOULD PREFER TO BE REPLACED WITH Z FUNCTIONS
  //
  if (typeof data === 'object') {
    if (settings.canonical) {
      data = canonicalize(data)
    //   console.log('\x1b[90mcanonical\x1b[0m')
    //   console.log(data)
    }
    if (settings.doLabelize) { data = labelize(data, settings.labellang) }
    if (settings.jsondir) {
      console.log(util.inspect(data, false, null, settings.color))
    } else {
      if (settings.color) {
        console.log(u.color_json_console(data))
      } else {
        console.log(JSON.stringify(data, null, 2))
      }
    }
  } else {
    console.log(data)
  }

  const linearizationtime = new Date() - startLinearization

  const timePassed = new Date() - startTime
  if (settings.timer) {
    const timertext = `${timePassed} ms (parse ${parsetime} ms, ` +
      `valid ${validationtime} ms, eval ${evaluationtime} ms, ` +
      `lin ${linearizationtime} ms)`
    if (settings.color) {
      console.log('\x1b[90m' + timertext + '\x1b[0m')
    } else {
      console.log(timertext)
    }
  }
}

exports.answer = answer
