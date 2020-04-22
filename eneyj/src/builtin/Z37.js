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
// builtin: reify

const i = require('./../index.js')
const c = i.constants
const u = i.utils
const listify = i.listify
const globalEvaluate = i.evaluate
const complete = i.complete

// TODO refactor
const toNativeObject = (context, argumentName) => {
  for (let ctx of context) {
    if (ctx.argument_name === argumentName) {
      return globalEvaluate(ctx.argument_value)
    }
  }
  return i.error(c.error.BUILTIN_COULD_NOT_FIND_CONTEXT_NAME, argumentName)
}

// TODO refactor
// TODO validate o?
const fromNativeObject = o => o

const reify = arg => {
  if (Array.isArray(arg)) arg = listify(arg)
  if (arg.Z1K1 === c.FUNCTION_CALL) {
    if (complete(arg)) arg = globalEvaluate(arg)
  }
  let fields = []
  for (let k in arg) fields.unshift(k)
  let result = {
    Z1K1: c.REFERENCE,
    Z9K1: 'Z13'
  }
  for (let k of fields) {
    if (arg[k] === undefined) continue
    let v = null
    if (typeof arg[k] === 'string') {
      v = {
        Z1K1: c.STRING,
        Z6K1: arg[k]
      }
    } else {
      v = reify(arg[k])
    }
    result = {
      Z1K1: c.LIST,
      Z10K1: {
        Z1K1: c.PAIR,
        Z2K1: {
          Z1K1: c.STRING,
          Z6K1: k
        },
        Z2K2: v
      },
      Z10K2: result
    }
  }
  return result
}

const builtin = context => {
  u.log('builtin:reify', context)
  const arg = toNativeObject(context, 'Z37K1')
  const result = reify(arg)
  return fromNativeObject(result)
}

exports.builtin = builtin
