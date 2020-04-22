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

const i = require('./../../index.js')
const c = i.constants
const globalEvaluate = i.evaluate
const natify = i.natify
const denatify = i.denatify

const validVariableName = varName => true

const translateError = err => {
  const lastLine = err.trim().split('\n').pop()

  if (lastLine.startsWith('ZeroDivisionError:')) {
    return {
      Z1K1: c.REFERENCE,
      Z9K1: 'Z442'
    }
  }

  return i.error(c.error.ERROR_IN_LANGUAGE_EXECUTION, lastLine)
}

const evaluate = data => {
  let code = 'from __future__ import print_function\n_args = {}\n'
  for (let a of data.context) {
    const argName = a.argument_name
    const argValue = globalEvaluate(a.argument_value)
    code += '_args["' + argName + '"] = ' + natify(argValue, __dirname) + '\n'
    if (validVariableName(argName)) {
      code += '' + argName + ' = _args["' + argName + '"]\n'
    }
  }
  code += data.Z16K2
  code += '\nprint(K0, end=\'\')'

  const uint8arrayToString = data => String.fromCharCode.apply(null, data)

  const spawnSync = require('child_process').spawnSync
  const scriptExecution = spawnSync('python', ['-c', code])

  const nativeError = uint8arrayToString(scriptExecution.stderr)
  if (nativeError) return translateError(nativeError)
  const nativeResult = uint8arrayToString(scriptExecution.stdout)
  const returnType = globalEvaluate(data.return_type)
  return denatify(nativeResult, returnType.Z4K1.Z9K1, __dirname)
}

exports.evaluate = evaluate
