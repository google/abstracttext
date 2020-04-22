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
/* eslint-disable no-new-func */

const i = require('./../../index.js')
const c = i.constants
const globalEvaluate = i.evaluate
const natify = i.natify
const denatify = i.denatify

const validVariableName = varName => true

const evaluate = data => {
  let code = 'let _args = {}\n'
  code += '_zargs = {}\n'
  for (let a of data.context) {
    const argName = a.argument_name
    const argValue = globalEvaluate(a.argument_value)
    const argType = a.argument_type
    if (argType !== argValue.Z1K1) {
      if (!(argType === c.OBJECT) && !(argType === c.STRING)) {
        return argValue
      }
    }
    const native = natify(argValue, __dirname)
    if (typeof native === 'object') return native
    code += '_args["' + argName + '"] = ' + native + '\n'
    const zarg = natify(argValue, __dirname, c.OBJECT)
    if (typeof zarg === 'object') return zarg
    code += '_zargs["' + argName + '"] = ' + zarg + '\n'
    if (validVariableName(argName)) {
      code += 'const ' + argName + ' = _args["' + argName + '"]\n'
      code += 'const Z1_' + argName + ' = _zargs["' + argName + '"]\n'
    }
  }
  code += data.Z16K2
  code += '\nreturn K0'
  const nativeResult = Function('', code)()
  const returnType = globalEvaluate(data.return_type)
  return denatify(nativeResult, returnType.Z4K1.Z9K1, __dirname)
}

exports.evaluate = evaluate
