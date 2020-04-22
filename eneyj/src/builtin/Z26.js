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
// builtin: write

const i = require('./../index.js')
const c = i.constants
const u = i.utils
const evaluate = i.evaluate
const write = u.write

// TODO refactor
const toNativeStringSerialization = (context, argumentName) => {
  for (let ctx of context) {
    if (ctx.argument_name === argumentName) {
      let value = ctx.argument_value
      if (value.Z7K1 && value.Z7K1.Z9K1 === 'Z100') value = evaluate(value)
      if (value.Z1K1 === c.ERROR) return value
      return value
    }
  }
  return i.error(c.error.BUILTIN_COULD_NOT_FIND_CONTEXT_NAME, argumentName)
}

// TODO refactor
const toNativeReference = (context, argumentName) => {
  for (let ctx of context) {
    if (ctx.argument_name === argumentName) {
      let value = evaluate(ctx.argument_value)
      if (value.Z1K1 === c.ERROR) return value
      return value.Z1K2
    }
  }
  return i.error(c.error.BUILTIN_COULD_NOT_FIND_CONTEXT_NAME, argumentName)
}

// TODO refactor
const fromNativeString = arg => {
  return {
    Z1K1: c.STRING,
    Z6K1: arg
  }
}

const builtin = context => {
  u.log('builtin:write', context)
  const arg = toNativeStringSerialization(context, 'Z26K1')
  const language = toNativeReference(context, 'Z26K2')
  if (language.Z1K1 === c.ERROR) return language
  const writing = write(arg, data => u.idlabel(data, language))
  const result = fromNativeString(writing)
  return result
}

exports.builtin = builtin
