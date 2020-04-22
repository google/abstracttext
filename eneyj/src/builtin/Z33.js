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
// builtin: same

const i = require('./../index.js')
const c = i.constants
const u = i.utils
const evaluate = i.evaluate
const write = u.write
const parse = i.parse

// TODO refactor
const toNativeStringSerialization = (context, argumentName) => {
  for (let ctx of context) {
    if (ctx.argument_name === argumentName) {
      // TODO this doesn't look particularly fast
      let value = evaluate(ctx.argument_value)
      if (value.Z1K1 === c.ERROR) return value
      return write(evaluate(parse('Z36(' + write(value) + ')', c.EN)))
    }
  }
  return i.error(c.error.BUILTIN_COULD_NOT_FIND_CONTEXT_NAME, argumentName)
}

// TODO refactor
const fromNativeBoolean = b => {
  if (b) {
    return {
      Z1K1: c.REFERENCE,
      Z9K1: 'Z54'
    }
  } else {
    return {
      Z1K1: c.REFERENCE,
      Z9K1: 'Z55'
    }
  }
}

const builtin = context => {
  u.log('builtin:same', context)
  const left = toNativeStringSerialization(context, 'Z33K1')
  if (left.Z1K1 === c.ERROR) return left
  const right = toNativeStringSerialization(context, 'Z33K2')
  if (right.Z1K1 === c.ERROR) return right
  const result = fromNativeBoolean(left === right)
  return result
}

exports.builtin = builtin
