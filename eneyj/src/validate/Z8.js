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

const i = require('./../index.js')
const c = i.constants
const globalValidate = i.validate
const follow = i.follow

const validateArguments = data => {
  if (data.Z1K1 === c.ERROR) return data
  if (data.Z8K1.Z1K1 === c.FUNCTION_CALL) return data // copout
  for (let argument of i.delistify(data.Z8K1)) {
    const arg = globalValidate(argument.Z17K1)
    if (arg.Z1K1 === c.ERROR) {
      return i.error(c.error.ERROR_IN_ARGUMENT, arg, 'val.Z8')
    }
  }

  return data
}

const uniqueArgumentNames = data => {
  if (data.Z1K1 === c.ERROR) return data

  if (data.Z8K1.Z1K1 === c.FUNCTION_CALL) return data // copout
  const argumentNames = new Set()
  for (let argument of i.delistify(data.Z8K1)) {
    if (argumentNames.has(argument.Z1K2)) {
      return i.error(c.error.REPEATED_ARGUMENT_NAME, argument.Z1K2)
    }
    argumentNames.add(argument.Z1K2)
  }

  return data
}

const checkArguments = data => {
  if (data.Z1K1 === c.ERROR) return data
  if (data.Z8K1.Z1K1 === c.FUNCTION_CALL) return data // copout
  for (let argument of i.delistify(data.Z8K1)) {
    let arg = follow(argument.Z17K1)

    if (arg.Z1K1 === c.ARGUMENT) continue // this is checked in implementations
    // TODO check in implementations
    if (arg.Z1K1 === c.TYPE) continue
    // TODO allow function call (but ensure it has the right type)
    if (arg.Z1K1 === c.FUNCTION_CALL) continue
    // TODO allow builtin (but ensure it has the right type)

    return i.error(c.error.ERROR_IN_ARGUMENT_TYPE, arg, 'val.Z8')
  }

  return data
}

const validateReturnType = data => {
  if (data.Z1K1 === c.ERROR) return data
  const rt = globalValidate(data.Z8K2)
  if (rt.Z1K1 === c.ERROR) {
    return i.error(c.error.ERROR_IN_RETURN_TYPE, rt)
  }

  return data
}

const checkReturnType = data => {
  if (data.Z1K1 === c.ERROR) return data
  const rt = follow(data.Z8K2)

  if (rt.Z1K1 === c.ARGUMENT) return data // checked in implementations
  // TODO check in implementations
  if (rt.Z1K1 === c.TYPE) return data
  // TODO allow function call (but ensure it has the right type)
  if (rt.Z1K1 === c.FUNCTION_CALL) return data
  // TODO allow builtin (but ensure it has the right type)

  return i.error(c.error.ERROR_IN_RETURN_TYPE, data)
}

const validateImplementations = data => {
  if (data.Z1K1 === c.ERROR) return data
  if (data.Z8K4.Z1K1 === c.FUNCTION_CALL) return data // copout
  for (let envelope of i.delistify(data.Z8K4)) {
    const impl = globalValidate(envelope.Z14K1)
    if (impl.Z1K1 === c.ERROR) {
      return i.error(c.error.ERROR_IN_IMPLEMENTATION, impl)
    }
  }

  return data
}

const checkFunctionCallReturnType = (data, implementation) => {
  const rt = follow(data.Z8K2)
  const message = 'validate/function.checkFunctionCallReturnType.'
  if (rt.Z1K1 !== c.TYPE) {
    return data // TODO coput
    //    return i.error(
    //      c.error.NOT_IMPLEMENTED_YET,
    //      message + rt.Z1K1 + ' in return type',
    //      'valid.Z8'
    //    )
  }

  const declaredReturnType = rt.Z4K1
  const fun = follow(implementation.Z7K1)
  if (fun.Z1K1 !== c.FUNCTION) {
    if (implementation !== undefined) return data // TODO copout
    return i.error(
      c.error.NOT_IMPLEMENTED_YET,
      message + fun.Z1K1 + ' to function',
      'valid.Z8'
    )
  }
  const funRt = follow(fun.Z8K2)
  if (funRt.Z1K1 !== c.TYPE) {
    return data // TODO copout/
    //    return i.error(
    //      c.error.NOT_IMPLEMENTED_YET,
    //      message + funRt.Z1K1 + ' to function return type',
    //      'valid.Z8'
    //    )
  }

  const actualReturnType = funRt.Z4K1
  // TODO deal with complex types, in particular function
  if (actualReturnType.Z9K1 === c.OBJECT) return data // TODO copout
  if (actualReturnType !== declaredReturnType) {
    return i.error(
      c.error.RETURN_TYPE_MISMATCH, [declaredReturnType, actualReturnType])
  }

  return data
}

const checkTests = data => {
  if (data.Z1K1 === c.ERROR) return data
  if (data.Z8K3 === undefined) return data

  // for (let test of data.Z8K3) {
  // TODO: check whether the arguments in the test fit the declared arguments
  // TODO: check whether the return value fits the declared return value
  // }

  return data
}

const uniqueTestIds = data => {
  if (data.Z1K1 === c.ERROR) return data
  if (data.Z8K3 === undefined) return data

  const testIds = new Set()
  for (let test of i.delistify(data.Z8K3)) {
    if (testIds.has(test.Z1K2)) {
      return i.error(c.error.REPEATED_TEST_ID, test.Z1K2)
    }
    testIds.add(test.Z1K2)
  }

  return data
}

const checkImplementations = data => {
  if (data.Z1K1 === c.ERROR) return data
  if (data.Z8K4.Z1K1 === c.FUNCTION_CALL) return data // copout
  for (let implementationEnvelope of i.delistify(data.Z8K4)) {
    // TODO check that IDs are not doubled
    const implementation = implementationEnvelope.Z14K1
    if (implementation.Z1K1 === c.BUILTIN) return data // TODO
    if (implementation.Z1K1 === c.FUNCTION_CALL) {
      return checkFunctionCallReturnType(data, implementation)
    }
    if (implementation.Z1K1 === c.REFERENCE) return data // TODO copout
    if (implementation.Z1K1 === c.ARGUMENT) return data // TODO copout
    if (implementation.Z1K1 === c.FUNCTION) return data // TODO
    if (implementation.Z1K1 === c.CODE) return data // TODO
    if (implementation.Z1K1 === c.LIST) return data // TODO
    if (implementation.Z1K1 === c.TABLE) return data // TODO
    if (implementation.Z1K1 === c.PAIR) return data // TODO copout
    let message = 'validate/function.checkImplementations.'
    message += implementation.Z1K1
    return i.error(c.error.NOT_IMPLEMENTED_YET, message, 'valid.Z8')
  }

  return data
}

const hasImplementationIds = data => {
  if (data.Z1K1 === c.ERROR) return data

  // if this is not a named function, it doesn't need named implementations
  if (data.Z1K2 === undefined) return data

  for (let implementation of i.delistify(data.Z8K4)) {
    if (implementation.Z1K2 === undefined) {
      return i.error(c.error.IMPLEMENTATION_ID_MISSING, implementation)
    }
  }

  return data
}

const uniqueImplementationIds = data => {
  if (data.Z1K1 === c.ERROR) return data

  if (data.Z8K4.Z1K1 === c.FUNCTION_CALL) return data // copout
  const implementationIds = new Set()
  for (let implementation of i.delistify(data.Z8K4)) {
    if (implementationIds.has(implementation.Z1K2)) {
      return i.error(c.error.REPEATED_IMPLEMENTATION_ID, implementation.Z1K2)
    }
    implementationIds.add(implementation.Z1K2)
  }

  return data
}

const validate = data => {
  if (data.Z1K1 === c.ERROR) return data
  data = validateArguments(data)
  data = uniqueArgumentNames(data)
  data = checkArguments(data)
  data = validateReturnType(data)
  data = checkReturnType(data)
  data = checkTests(data)
  data = uniqueTestIds(data)
  data = validateImplementations(data)
  data = checkImplementations(data)
  data = hasImplementationIds(data)
  data = uniqueImplementationIds(data)
  return data
}

exports.validate = validate
