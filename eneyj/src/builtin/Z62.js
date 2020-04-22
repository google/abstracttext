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
// builtin: string_to_characterlist

const i = require('./../index.js')
const c = i.constants
const u = i.utils
const globalEvaluate = i.evaluate

// TODO refactor
const toNativeString = (context, argumentName) => {
  for (let ctx of context) {
    if (ctx.argument_name === argumentName) {
      if (ctx.Z1K1 === c.ERROR) return ctx
      let value = globalEvaluate(ctx.argument_value)
      if (value.Z1K1 === c.ERROR || value.Z1K1 === c.EXCEPTION) {
        return i.error(c.error.ERROR_IN_ARGUMENT, value, 'builtin.Z62')
      }
      if (value.Z1K1 !== c.STRING) {
        return i.error(
          c.error.BUILTIN_TYPE_MISMATCH, [c.STRING, value.Z1K1], 'builtin.Z62')
      }
      return value.Z6K1
    }
  }
  return i.error(
    c.error.BUILTIN_COULD_NOT_FIND_CONTEXT_NAME, argumentName, 'builtin.Z62')
}

const fold = arg => {
  if (arg.Z1K1 === c.ERROR) return arg
  if (arg === '') {
    return {
      Z1K1: c.REFERENCE,
      Z9K1: 'Z13'
    }
  }

  return {
    Z1K1: c.LIST,
    Z10K1: {
      Z1K1: c.CHARACTER,
      Z60K1: arg[0]
    },
    Z10K2: fold(arg.slice(1))
  }
}

const builtin = context => {
  u.log('builtin:string_to_characterlist', context)
  const arg = toNativeString(context, 'Z62K1')
  return fold(arg)
}

exports.builtin = builtin
