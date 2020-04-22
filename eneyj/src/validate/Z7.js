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
const u = i.utils
const globalValidate = i.validate
const follow = i.follow

const validateComponent = (data, component, error) => {
  if (data.Z1K1 === c.ERROR) return data
  component = globalValidate(component)
  if (component.Z1K1 !== c.ERROR) return data

  return i.error(error, component)
}

const validateFunction = data => validateComponent(data, data.Z7K1, c.error.ERROR_IN_FUNCTION)

const checkArguments = data => {
  if (data.Z1K1 === c.ERROR) return data
  for (let argument in data) {
    if (u.zid(argument) === c.OBJECT) continue
    if (u.zid(argument) === c.FUNCTION_CALL) continue
    const arg = globalValidate(data[argument])
    if (arg.Z1K1 !== c.ERROR) continue

    return i.error(c.error.ERROR_IN_ARGUMENT, arg, 'val.Z7')
  }
  return data
}

/* TODO coercion
const canCoerce = (declared, actual) => {
  if (declared === actual) return true

  const declaredType = getData(declared)
  if (declaredType.Z4K5 === undefined) return false

  for (let coercion of declaredType.Z4K5) {
    const coercionFrom = follow(coercion.from)
    if (coercionFrom.Z4K1 === actual) return true
  }

  return false
}
*/

// TODO: refactor
const checkArgumentTypeMatchesArguments = data => {
  if (data.Z1K1 === c.ERROR) return data

  // get declared names and types
  const calledFunction = i.pretransform(data)
  // TODO type function_call
  // TODO type argument
  // TODO this could also be a reference or an builtin
  if (calledFunction.Z1K1 === c.TYPE) return data // TODO copout
  if (calledFunction.Z1K1 === c.FUNCTION_CALL) {
    if (calledFunction !== undefined) return data // TODO copout
    const returnTypeFunction = follow(calledFunction.Z7K1)
    if (returnTypeFunction.Z8K2.Z9K1 !== c.FUNCTION) {
      return i.error(c.error.FUNCTION_CALL_CALLS_NON_FUNCTION, data)
    } // TODO this above is still bad. needs to be more thought through
  } // TODO also, it still doesn't work
  if (calledFunction.Z1K1 === c.ARGUMENT) return data // TODO copout
  if (calledFunction.Z1K1 === c.EXCEPTION) return data // TODO copout
  if (calledFunction.Z1K1 !== c.FUNCTION) {
    return i.error(c.error.FUNCTION_CALL_CALLS_NON_FUNCTION, data)
  }
  const declaredArguments = []
  for (let argument of i.delistify(calledFunction.Z8K1)) {
    let declaredArgumentName = argument.Z1K2
    let declaredArgumentData = follow(argument.Z17K1)
    // TODO type function_call
    // TODO type argument
    declaredArguments.push({
      Z1K2: declaredArgumentName,
      Z17K1: declaredArgumentData.Z4K1
    })
  }

  // get given names and types
  const givenArguments = []

  // get given names and types
  for (let argument in data) {
    if (u.zid(argument) === c.OBJECT) continue
    if (u.zid(argument) === c.FUNCTION_CALL) continue
    let givenArgumentName = (argument[0] === 'K') ? undefined : argument
    let givenArgumentData = follow(data[argument])
    if (Array.isArray(givenArgumentData)) {
      givenArgumentData = i.listify(givenArgumentData)
    }
    // TODO type function_call
    // TODO type argument
    givenArguments.push({
      argument_name: givenArgumentName, // TODO
      Z17K1: givenArgumentData.Z1K1
    })
  }

  if (declaredArguments.length !== givenArguments.length) {
    return i.error(c.error.ARITY_MISMATCH, data)
  }

  // check if names are given or if it is positional
  if ((givenArguments.length > 0) && (givenArguments[0].argument_name !== undefined)) {
    // ensure all names are given
    // TODO test this part
    for (let argument of givenArguments) {
      if (argument.argument_name === undefined) {
        return i.error(
          c.error.MIXING_POSITIONAL_AND_NAMED_ARGUMENTS, givenArguments)
      }
    }

    // check whether names double
    const givenNames = new Set()
    for (let argument of givenArguments) {
      if (givenNames.has(argument.argument_name)) {
        return i.error(c.error.REPEATED_ARGUMENT_NAME, argument.argument_name)
      }
      givenNames.add(argument.argument_name)
    }

    const declaredNames = new Set()
    for (let argument of declaredArguments) {
      declaredNames.add(argument.Z1K2)
    }

    for (let n of declaredNames) {
      if (!givenNames.has(n)) {
        return i.error(
          c.error.ARGUMENT_NAME_MISMATCH,
          [Array.from(declaredNames), Array.from(givenNames)]
        )
      }
    }

    for (let argument of declaredArguments) {
      let declaredName = argument.Z1K2
      for (let given of givenArguments) {
        let givenName = given.argument_name
        if (declaredName === givenName) {
          // TODO: deal with complex types
          // TODO: deal with arguments
          // TODO: the breaks down there break too much
          // that is why lambda_if(lambda_to_boolean(true), true, false)
          // passes but lambda_if(lambda_true, true, false) does not
          let declaredType = argument.Z17K1
          let givenType = given.Z17K1
          if (declaredType === undefined) break // TODO copout!
          if (givenType === c.FUNCTION_CALL) break // TODO copout!
          if (givenType === c.ARGUMENT) break // TODO copout!
          if (givenType === c.NOTHING) break // TODO coput
          if (givenType === c.EXCEPTION) break // TODO copout
          if (declaredType.Z9K1 === c.OBJECT) break // TODO copout
          if (declaredType.Z9K1 !== givenType) {
            //            if (canCoerce(declaredType, givenType)) break
            return i.error(
              c.error.ARGUMENT_TYPE_MISMATCH,
              [declaredType.Z9K1, givenType],
              'val.Z7'
            )
          }
          break
        }
      }
    }
  } else { // positional arguments
    // TODO test this path
    // ensure all arguments are positional
    for (let argument of givenArguments) {
      if (argument.argument_name !== undefined) {
        return i.error(
          c.error.MIXING_POSITIONAL_AND_NAMED_ARGUMENTS, givenArguments)
      }
    }

    // TODO refactor
    for (let n = 0; n < declaredArguments.length; n++) {
      // TODO: deal with complex types
      // TODO: deal with arguments
      let declaredType = declaredArguments[n].Z17K1
      let givenType = givenArguments[n].Z17K1
      if (declaredType === undefined) break // TODO copout!
      if (givenType === c.ARGUMENT) break // TODO copout!
      if (givenType === c.FUNCTION_CALL) break // TODO copout!
      if (givenType === c.EXCEPTION) break // TODO copout
      if (declaredType.Z9K1 === c.OBJECT) break // TODO copout
      if (declaredType.Z9K1 === 'Z40' && givenType === 'Z8') break // TODO copout
      if (givenType === c.NOTHING) break // TODO coput
      if (declaredType.Z9K1 !== givenType) {
        //        if (canCoerce(declaredType, givenType)) break
        return i.error(
          c.error.ARGUMENT_TYPE_MISMATCH,
          [declaredType.Z9K1, givenType],
          'val.Z7')
      }
    }
  }

  return data
}

const validate = data => {
  if (data.Z1K1 === c.ERROR) return data
  data = validateFunction(data)
  data = checkArguments(data)
  data = checkArgumentTypeMatchesArguments(data)
  return data
}

exports.validate = validate
