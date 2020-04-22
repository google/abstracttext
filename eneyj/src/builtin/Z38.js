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
// builtin: abstract

const i = require('./../index.js')
const c = i.constants
const u = i.utils
const globalEvaluate = i.evaluate

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

const makeAbstract = (list, o) => {
  if (list.Z1K1 === c.EXCEPTION || list.Z1K1 === c.ERROR) {
    return list
  }
  if (list.Z1K1 !== c.LIST) {
    return i.error(c.error.BUILTIN_TYPE_MISMATCH, [c.LIST, list.Z1K1])
  }
  const head = globalEvaluate(list.Z10K1)
  if (head.Z1K1 === c.EXCEPTION) {
    if (head.Z1K2 === 'Z441') return o
    return head
  }
  if (head.Z1K1 === c.EXCEPTION || head.Z1K1 === c.ERROR) {
    return head
  }
  if (head.Z1K1 !== c.PAIR) {
    return i.error(c.error.BUILTIN_TYPE_MISMATCH, [c.PAIR, head.Z1K1])
  }
  const first = globalEvaluate(head.Z2K1)
  if (first.Z1K1 !== c.STRING) {
    return i.error(c.error.BUILTIN_TYPE_MISMATCH, [c.STRING, first.Z1K1])
  }
  const second = globalEvaluate(head.Z2K2)
  if (second.Z1K1 === c.ERROR || second.Z1K1 === c.EXCEPTION) { return second }
  if (second.Z1K1 === c.STRING) {
    o[first.Z6K1] = second.Z6K1
  } else {
    if (second.Z1K1 === c.LIST) {
      o[first.Z6K1] = makeAbstract(globalEvaluate(second), {})
    } else {
      return i.error(c.error.BUILTIN_TYPE_MISMATCH, [c.LIST, first.Z1K1])
    }
  }
  return makeAbstract(globalEvaluate(list.Z10K2), o)
}

const builtin = context => {
  u.log('builtin:abstract', context)
  const arg = toNativeObject(context, 'Z38K1')
  const result = makeAbstract(arg, {})
  return fromNativeObject(result)
}

exports.builtin = builtin
