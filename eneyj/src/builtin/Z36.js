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
// builtin: value

const i = require('./../index.js')
const c = i.constants
const u = i.utils
const evaluate = i.evaluate

// TODO refactor
const toNativeStringSerialization = (context, argumentName) => {
  for (let ctx of context) {
    if (ctx.argument_name === argumentName) {
      let value = evaluate(ctx.argument_value)
      if (value.Z1K1 === c.ERROR) return value
      return value
    }
  }
  return i.error(c.error.BUILTIN_COULD_NOT_FIND_CONTEXT_NAME, argumentName)
}

const properKeys = arg => {
  const keys = Object.keys(arg).sort(u.sortzkids)
  return keys.filter(key => !key.startsWith('Z1K'))
}

const justValue = arg => {
  // native string
  if (typeof arg === 'string') return arg

  const proper = properKeys(arg)

  // symbol, id
  if (proper.length === 0) return arg

  let result = {}
  result.Z1K1 = arg.Z1K1
  for (const k of proper) {
    result[k] = arg[k]
  }

  return result
}

// TODO refactor
const fromNativeObject = o => o

const builtin = context => {
  u.log('builtin:value', context)
  const arg = toNativeStringSerialization(context, 'Z36K1')
  if (arg.Z1K1 === c.ERROR) return arg
  const val = justValue(arg)
  const result = fromNativeObject(val)
  return result
}

exports.builtin = builtin
