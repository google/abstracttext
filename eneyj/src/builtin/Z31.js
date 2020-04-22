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
// builtin: if

const i = require('./../index.js')
const c = i.constants
const u = i.utils
const globalEvaluate = i.evaluate

// TODO refactor
const toNativeBoolean = (context, argumentName) => {
  for (let ctx of context) {
    if (ctx.argument_name === argumentName) {
      if (ctx.Z1K1 === c.ERROR) return ctx
      let value = globalEvaluate(ctx.argument_value)
      if (value.Z1K1 === c.ERROR || value.Z1K1 === c.EXCEPTION) {
        return i.error(c.error.ERROR_IN_ARGUMENT, value, 'builtin.Z31')
      }
      if (value.Z1K1 !== c.BOOLEAN) {
        return i.error(
          c.error.BUILTIN_TYPE_MISMATCH,
          [c.BOOLEAN, value.Z1K1],
          'builtin.Z31'
        )
      }
      return (value.Z1K2 === 'Z54')
    }
  }
  return i.error(
    c.error.BUILTIN_COULD_NOT_FIND_CONTEXT_NAME,
    argumentName,
    'builtin.Z31'
  )
}

// TODO refactor
const toNativeObject = (context, argumentName) => {
  for (let ctx of context) {
    if (ctx.argument_name === argumentName) {
      return ctx.argument_value
    }
  }
  return i.error(
    c.error.BUILTIN_COULD_NOT_FIND_CONTEXT_NAME,
    argumentName,
    'builtin.Z31'
  )
}

// TODO refactor
// TODO validate o?
const fromNativeObject = o => o

const builtin = context => {
  u.log('builtin:Z31', context)
  const condition = toNativeBoolean(context, 'Z31K1')
  const consequence = toNativeObject(context, 'Z31K2')
  const alternative = toNativeObject(context, 'Z31K3')
  let result = condition
  if (condition === true) result = consequence
  if (condition === false) result = alternative
  return fromNativeObject(result)
}

exports.builtin = builtin
