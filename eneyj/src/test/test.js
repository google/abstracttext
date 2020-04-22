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

const startTime = new Date()

const fs = require('fs')
const debug = require('debug')

const i = require('./../index.js')
const validate = i.validate
const evaluate = i.evaluate
const parse = i.parse

const u = i.utils
const c = i.constants
const l = c.language
const e = c.error

const getData = i.getData

const data = {}

let numberOfTests = 0
let numberOfErrors = 0

const log = console.log

const T = 'true'
const F = 'false'
const TT = 'boolean(true)'
const FF = 'boolean(false)'

let argRest = 2

let stopOnError = false
let showDebug = false
let showLog = false

while (process.argv[argRest] !== undefined) {
  let unknownArg = true
  if (process.argv[argRest] === '--stop') {
    stopOnError = true
    unknownArg = false
  }
  if (process.argv[argRest] === '--log') {
    showLog = true
    unknownArg = false
  }
  if (process.argv[argRest] === '--debug') {
    showDebug = true
    unknownArg = false
  }
  if (unknownArg) {
    console.log('ERROR - Unknown argument: ' + process.argv[argRest])
    process.exit(1)
  }
  argRest++
}

if (showLog) {
  debug.enable('eneyj:log:test')
}
if (showDebug) {
  debug.enable('eneyj:debug,eneyj:log:*')
}

const assertEqual = (actual, expected, message) => {
  numberOfTests += 1
  if (actual === expected) return

  numberOfErrors += 1
  log('Error: ' + message)
  log('Expected:')
  log(expected)
  log('Actual:')
  log(actual)
  log('')
  if (stopOnError) process.exit(1)
}

const assertError = (result, errorCode, message) => {
  numberOfTests += 1

  if (result.Z1K1 !== c.ERROR) {
    numberOfErrors += 1
    log('Error: ' + message)
    log('Expected an error, but got this instead.')
    log(result)
    log('')
    if (stopOnError) process.exit(1)
    return
  }

  if (result.Z5K1.Z9K1 !== errorCode) {
    numberOfErrors += 1
    log('Error: ' + message)
    log('Expected error-code:')
    log(u.idlabel(errorCode, l.EN))
    log('Actual error-code:')
    log(u.idlabel(result.Z5K1, l.EN))
    log('')
    if (stopOnError) process.exit(1)
  }
}

const assertText = (text, expected) => {
  u.log('test', text)

  let call = text
  if (call.substr(-1) !== ')') call = 'value(' + call + ')'
  call = 'write_eval(' + call + ', English)'

  const context = []
  const answer = evaluate(validate(parse(call, l.EN)), context)

  assertEqual(answer.Z6K1, expected, text)
}

const isWellFormed = (data, dataName) => {
  u.log('test', 'wellformed ' + dataName)
  if (data.Z1K1 !== c.ERROR) return

  numberOfErrors += 1
  log('Error: ' + u.idlabel(dataName, l.EN) + ' ' + dataName)
  log('Error message: ' + u.idlabel(data.Z5K1, l.EN))
  log('Details:')
  log(data.Z5K2)
  log('')
  if (stopOnError) process.exit(1)
}

const isValid = (data, dataName) => {
  u.log('test', 'valid ' + dataName)
  data = validate(data)
  if (data.Z1K1 !== c.ERROR) return

  numberOfErrors += 1
  log('Error: ' + u.idlabel(dataName, l.EN) + ' ' + dataName)
  log('Error message: ' + u.idlabel(data.Z5K1, l.EN))
  log('Details:')
  log(data.Z5K2)
  log('')
  if (stopOnError) process.exit(1)
}

const checkAll = (dataNames, checker) => {
  for (let nom of dataNames) {
    numberOfTests += 1
    data[nom] = getData(nom)
    checker(data[nom], nom)
  }
}

const raiseError = (text, errorCode, errorCodeInternal) => {
  u.log('test', text)
  numberOfTests += 1
  var d = parse(text, l.EN)
  d = evaluate(validate(d), [])
  // TODO: ideally only validate, evaluate detects runtime errors. would be
  // interesting to separate these and make it explicit.
  if (d.Z1K1 !== c.ERROR) {
    numberOfErrors += 1
    log('Error: ' + text)
    log('Expected an error, but got this instead.')
    log(d)
    log('')
    if (stopOnError) process.exit(1)
    return
  }

  // TODO: simplify once all errors are migrated
  if (!(d.Z5K1 === errorCode || d.Z5K1.Z9K1 === errorCode)) {
    numberOfErrors += 1
    log('Error: ' + text)
    log('Expected error-code:')
    log(u.idlabel(errorCode, l.EN))
    log('Actual error-code:')
    log(u.idlabel(d.Z5K1, l.EN))
    log('')
    if (stopOnError) process.exit(1)
    return
  }

  // TODO: simplify once all errors are migrated
  if (errorCodeInternal !== undefined &&
      d.Z5K2.Z1K1 === c.ERROR &&
      !(d.Z5K2.Z5K1 === errorCodeInternal ||
        d.Z5K2.Z5K1.Z9K1 === errorCodeInternal)) {
    numberOfErrors += 1
    log('Error: ' + text)
    log('Expected internal error-code:')
    log(u.idlabel(errorCodeInternal, l.EN))
    log('Actual internal error-code:')
    log(u.idlabel(d.Z5K2.Z5K1, l.EN))
    log('')
    if (stopOnError) process.exit(1)
  }
}

const assertReification = (name) => {
  u.log('test', 'reify ' + name)
  const context = []
  const expectCall = 'write(value(' + name + '), English)'
  const expected = evaluate(expectCall, context).Z6K1
  const actualCall = 'write(value(abstract(reify(' + name + '))), English)'
  const actual = evaluate(actualCall, context).Z6K1
  assertEqual(actual, expected, 'abstract(reify(' + name + '))')
}

const filelist = fs.readdirSync(u.config('datapath'))
const dataNamesAreWellFormedButNotValid = filelist
  .filter(n => n[0] === 'B')
  .map(n => n.slice(0, -5))
  .filter(n => !['B0', 'B2', 'B3', 'B4', 'B51', 'B52'].includes(n))
const dataNamesAreValid = filelist
  .filter(n => n[0] === 'Z')
  .map(n => n.slice(0, -5))

checkAll(dataNamesAreWellFormedButNotValid, isWellFormed)

checkAll(dataNamesAreValid, isWellFormed)
checkAll(dataNamesAreValid, isValid)

assertEqual(u.idlabel('Z4', l.EN), 'type', 'idlabel(Z4, en)')
assertEqual(u.idlabel('Z4', l.DE), 'Typ', 'idlabel(Z4, de)')
assertEqual(u.idlabel('Z1K1', l.EN), 'type', 'idlabel(Z1K1, en)')
assertEqual(u.idlabel('Z1K2', l.EN), 'id', 'idlabel(Z1K2, en)')
assertEqual(u.idlabel('Z144K1', l.EN), 'left', 'idlabel(Z144K1, en)')

assertEqual(u.delabel('type', l.EN), 'Z4', 'delabel(type, en)')
assertEqual(u.delabel('Typ', l.DE), 'Z4', 'delabel(Typ, de)')

assertEqual(u.escapeString(''), '""', 'escapeString(\'\')')
assertEqual(u.escapeString('a'), '"a"', 'escapeString(\'a\')')
assertEqual(u.escapeString('0'), '"0"', 'escapeString(\'0\')')
assertEqual(u.escapeString(' '), '" "', 'escapeString(\' \')')
assertEqual(u.escapeString('.'), '"."', 'escapeString(\'.\')')
assertEqual(u.escapeString('one'), '"one"', 'escapeString(\'one\')')
assertEqual(
  u.escapeString('A string'),
  '"A string"',
  'escapeString(\'A string\')'
)
assertEqual(u.escapeString(' a '), '" a "', 'escapeString(\' a \')')
assertEqual(u.escapeString('  '), '"  "', 'escapeString(\'  \')')
assertEqual(u.escapeString('/'), '"/"', 'escapeString(\'/\')')
assertEqual(u.escapeString('\\'), '"\\\\"', 'escapeString(\'\\\')')
assertEqual(u.escapeString('"'), '"\\""', 'escapeString(\'"\')')
assertEqual(
  u.escapeString('positive_integer("1")'),
  '"positive_integer(\\"1\\")"',
  'escapeString(\'positiv_integer("1")\')'
)
assertEqual(
  u.escapeString('"string"'),
  '"\\"string\\""',
  'escapeString(\'"string"\')'
)

assertError(
  u.unescapeString(''),
  e.INVALID_STRING_LITERAL,
  'unescapeString(\'\')'
)
assertError(
  u.unescapeString(' '),
  e.INVALID_STRING_LITERAL,
  'unescapeString(\' \')'
)
assertError(
  u.unescapeString('  '),
  e.INVALID_STRING_LITERAL,
  'unescapeString(\'  \')'
)
assertError(
  u.unescapeString('"'),
  e.INVALID_STRING_LITERAL,
  'unescapeString(\'"\')'
)
assertEqual(u.unescapeString('""'), '', 'unescapeString(\'""\')')
assertEqual(u.unescapeString('"a"'), 'a', 'unescapeString(\'"a"\')')
assertEqual(u.unescapeString('"0"'), '0', 'unescapeString(\'"0"\')')
assertEqual(u.unescapeString('" "'), ' ', 'unescapeString(\'" "\')')
assertEqual(u.unescapeString('"  "'), '  ', 'unescapeString(\'"  "\')')
assertEqual(u.unescapeString('" a "'), ' a ', 'unescapeString(\'" a "\')')
assertError(
  u.unescapeString('"""'),
  e.INVALID_STRING_LITERAL,
  'unescapeString(\'"""\')'
)
assertError(
  u.unescapeString('"\\"'),
  e.INVALID_STRING_LITERAL,
  'unescapeString(\'"\\"\')'
)
assertError(
  u.unescapeString('"\\'),
  e.INVALID_STRING_LITERAL,
  'unescapeString(\'"\\\')'
)
assertError(
  u.unescapeString('"\\y"'),
  e.INVALID_STRING_LITERAL,
  'unescapeString(\'"\\y"\')'
)
assertEqual(u.unescapeString('"\'"'), '\'', 'unescapeString(\'"\'"\')')
assertEqual(u.unescapeString('"\\""'), '"', 'unescapeString(\'"\\""\')')
assertEqual(u.unescapeString('"\\\\"'), '\\', 'unescapeString(\'"\\\\"\')')
assertEqual(u.unescapeString('"one"'), 'one', 'unescapeString(\'"one"\')')
assertEqual(
  u.unescapeString('"not_a_token"'),
  'not_a_token',
  'unescapeString(\'"not_a_token"\')'
)
assertEqual(
  u.unescapeString('"positive_integer(\\"1\\")"'),
  'positive_integer("1")',
  'unescapeString(\'"positiv_integer(\\"1\\")"\')'
)
assertEqual(u.unescapeString('"end"'), 'end', 'unescapeString(\'end\')')

raiseError('illformed_ID', e.JSON_SCHEMA_ERROR)
raiseError('no_type', e.ERROR_IN_REFERENCE, e.ZOBJECT_HAS_NO_TYPE)
raiseError('B2', e.ERROR_IN_REFERENCE, e.NOT_WELL_FORMED)
raiseError('B3', e.ERROR_IN_REFERENCE, e.DATA_HAS_NO_ID)
raiseError('B4', e.ERROR_IN_REFERENCE, e.DATA_ID_MISMATCH)
raiseError('type_is_I_combinator', e.ERROR_IN_REFERENCE, e.ERROR_IN_TYPE)
raiseError('type_is_true', e.ERROR_IN_REFERENCE, e.ERROR_IN_TYPE)
raiseError('reference_not_well_formed', e.NOT_WELL_FORMED)
raiseError('unknown_type', e.JSON_SCHEMA_ERROR)
raiseError('missing_reference', e.NAME_DOES_NOT_EXIST)
raiseError('self_reference', e.CYCLIC_REFERENCE)
raiseError('refer_to_next', e.CYCLIC_REFERENCE)
raiseError('refer_to_previous', e.CYCLIC_REFERENCE)
raiseError('bad_boolean', e.ERROR_IN_REFERENCE, e.JSON_SCHEMA_ERROR)
raiseError('boolean_with_extra_field', e.ERROR_IN_REFERENCE, e.JSON_SCHEMA_ERROR)
raiseError('negate_true_with_function_error', e.ERROR_IN_REFERENCE, e.ERROR_IN_FUNCTION, e.JSON_SCHEMA_ERROR)
raiseError('negate_true_with_argument_error', e.ERROR_IN_REFERENCE, e.ERROR_IN_ARGUMENT, e.JSON_SCHEMA_ERROR)
raiseError('negate_true_with_missing_reference', e.ERROR_IN_REFERENCE, e.ERROR_IN_ARGUMENT, e.ERROR_IN_REFERENCE)
raiseError('true_as_function', e.ERROR_IN_REFERENCE, e.FUNCTION_CALL_CALLS_NON_FUNCTION)
raiseError('negate_true_with_two_args', e.ERROR_IN_REFERENCE, e.ARITY_MISMATCH)
raiseError('negate_true_with_no_args', e.ERROR_IN_REFERENCE, e.ARITY_MISMATCH)
raiseError('negate_call_wrong_argument_name', e.ERROR_IN_REFERENCE, e.ARGUMENT_NAME_MISMATCH)
raiseError('negate_call_wrong_argument_type', e.ERROR_IN_REFERENCE, e.ARGUMENT_TYPE_MISMATCH)
raiseError('and_call_bad_arg_name', e.ERROR_IN_REFERENCE, e.ARGUMENT_NAME_MISMATCH)
raiseError('and_call_three', e.ERROR_IN_REFERENCE, e.ARITY_MISMATCH)
raiseError('negate_invalid', e.ERROR_IN_REFERENCE, e.ERROR_IN_IMPLEMENTATION, e.UNKNOWN_KEY)
raiseError('negate_unknown_internal', e.ERROR_IN_REFERENCE, e.ERROR_IN_IMPLEMENTATION, e.UNKNOWN_BUILTIN)
// TODO: check that arg names don't have spaces
// raiseError('negate_arg_name_with_space', e.JSON_SCHEMA_ERROR)
// TODO: check that arg names don't have special characters
// raiseError('negate_arg_name_with_special', e.JSON_SCHEMA_ERROR)
raiseError('and_bad_arg', e.ERROR_IN_REFERENCE, e.ERROR_IN_ARGUMENT, e.JSON_SCHEMA_ERROR)
raiseError('and_with_two_same_args', e.ERROR_IN_REFERENCE, e.REPEATED_ARGUMENT_NAME)
raiseError('and_type_boolean', e.ERROR_IN_REFERENCE, e.ERROR_IN_ARGUMENT_TYPE)
raiseError('negate_return_type_invalid', e.ERROR_IN_REFERENCE, e.ERROR_IN_RETURN_TYPE, e.UNKNOWN_KEY)
raiseError('negate_return_type_false', e.ERROR_IN_REFERENCE, e.ERROR_IN_RETURN_TYPE)
raiseError('negate_return_type', e.ERROR_IN_REFERENCE, e.RETURN_TYPE_MISMATCH)
raiseError('if_internal_bad_arg', e.BUILTIN_COULD_NOT_FIND_CONTEXT_NAME)
raiseError('string_bad', e.ERROR_IN_REFERENCE, e.UNKNOWN_KEY)
// raiseError('string_object', e.STABLE_KEY_HAS_NON_STRING_VALUE) TODO see _validate.checkTypes
raiseError('B51', e.ERROR_IN_REFERENCE, e.ZOBJECTS_ONLY_ALLOW_STRINGS_AND_OBJECTS)
raiseError('B52', e.ERROR_IN_REFERENCE, e.ZOBJECTS_ONLY_ALLOW_STRINGS_AND_OBJECTS)

raiseError('construct_bad', e.ARITY_MISMATCH)
raiseError('pair(true)', e.ARITY_MISMATCH)
raiseError('pair(true, true, true)', e.ARITY_MISMATCH)

raiseError('nega+e(true)', e.UNKNOWN_TOKEN)
raiseError('if boolean(true, false, true)', e.SYNTAX_ERROR)
raiseError('if (true), false, true)', e.SYNTAX_ERROR)
raiseError('if (true) boolean(true, false, true)', e.SYNTAX_ERROR)
raiseError('if (true false true)', e.SYNTAX_ERROR)
raiseError('if true)', e.SYNTAX_ERROR)
raiseError('if (true(), false(), true()))', e.SYNTAX_ERROR)
raiseError('  or (  true, and(false,true)', e.SYNTAX_ERROR)
raiseError('negate true()', e.SYNTAX_ERROR)
raiseError('same(if_boolean, if(boolean)', e.SYNTAX_ERROR)
raiseError('negate((true))', e.ERROR_IN_ARGUMENT, e.SYNTAX_ERROR)
raiseError('negate("true)', e.UNBALANCED_QUOTES)
raiseError('negate("true", ")', e.UNBALANCED_QUOTES)
raiseError('argument_reference("arg")', e.JSON_SCHEMA_ERROR)
// TODO raiseError('boolean("true", "false")', e.ARITY_MISMATCH)
raiseError(
  'if_kleenean_condition(kleenean)(' +
    'maybe, kleenean_true, kleenean_false)',
  e.BUILTIN_TYPE_MISMATCH)
raiseError('if_kleenean_condition(boolean)(kleenean_true, true, false)',
  e.BUILTIN_TYPE_MISMATCH)
raiseError('if_kleenean_condition(kleenean)(kleenean_true, true, false)',
  e.BUILTIN_TYPE_MISMATCH)
// TODO the return of false is boolean true, kleenean true
// raiseError('kleenean_negate_type_mismatch', e.RETURN_TYPE_MISMATCH)

// TODO raiseError('apply_boolean_binary_bad_impl', 'd')
raiseError('apply_boolean_binary_negate_true', e.ERROR_IN_REFERENCE, e.ARITY_MISMATCH)
// TODO raiseError('apply_boolean_binary_negate_true_false', 'd')
raiseError('no_implementation_id', e.ERROR_IN_REFERENCE, e.IMPLEMENTATION_ID_MISSING)
raiseError('duplicate_implementation_id', e.ERROR_IN_REFERENCE, e.REPEATED_IMPLEMENTATION_ID)
raiseError('duplicate_test_id', e.ERROR_IN_REFERENCE, e.REPEATED_TEST_ID)
raiseError('unknown_programming_language', e.ERROR_IN_REFERENCE, e.ERROR_IN_IMPLEMENTATION, e.JSON_SCHEMA_ERROR)
raiseError('unmapped_type(true)', e.TYPE_NOT_SUPPORTED_FOR_LANGUAGE)
raiseError('multilingual_text_bad_type', e.ERROR_IN_REFERENCE, e.KEY_VALUE_TYPE_MISMATCH)
raiseError('B53', e.ERROR_IN_REFERENCE, e.KEY_VALUE_TYPE_MISMATCH)

assertText('intentional', 'intentional')
assertText('Z444', 'intentional')

assertText('true', TT)
assertText('false', FF)
assertText('boolean(true)', TT)
assertText('negate_true', FF)
assertText('negate_false', TT)
assertText('negate_negate_true', TT)
assertText('and_true_false', FF)
assertText('and_true_false_different_order', FF)
assertText('and_true_true', TT)
assertText('and_false_false', FF)
assertText('and_false_true', FF)
assertText('or_true_true', TT)
assertText('or_false_false', FF)
assertText('or_false_true', TT)
assertText('xor_true_true', FF)
assertText('xor_false_false', FF)
assertText('xor_false_true', TT)
assertText('and_negate_false_negate_false', TT)
assertText('negate_and_true_false', TT)
assertText('negate_and_true_true', FF)
assertText('refer_to_one', TT)
assertText('refer_to_two', TT)
assertText('refer_to_three', TT)
assertText('refer_to_four', TT)

assertText('apply_boolean_binary',
  'function([binary_function, left, right], boolean, [Z346C1])')
assertText('apply_boolean_binary_and_true_false', FF)
assertText('apply_boolean_binary(and, true, false)', F)
assertText('apply_boolean_binary(or, false, true)', T)
assertText('apply_boolean_binary(or, false, false)', F)
assertText('apply_boolean_binary(xor, true, true)', F)
assertText('apply_boolean_binary(xor, true, false)', T)

assertText('apply_boolean_unary',
  'function([unary_function, arg], boolean, [Z347C1])')
assertText('apply_boolean_unary_negate_true', FF)
assertText('apply_boolean_unary(negate, true)', F)
assertText('apply_boolean_unary(negate, false)', T)

assertText(
  'curry_and_true',
  'function([K1], boolean, ' +
    '[implementation(and(true, argument_reference("K1")))])'
)
assertText('apply_curry_and_true_false', FF)
assertText('apply_curry_and_true_false_positional', FF)
assertText('curry_and_true(false)', F)
assertText('curry_and_true(true)', T)
assertText('curry_and_true(false)', F)
assertText('curry_boolean_binary(and, true)(false)', F)
assertText('curry_boolean_binary(or, true)(false)', T)
assertText('curry_boolean_binary(xor, true)(true)', F)
assertText('curry_boolean_binary(xor, true)(false)', T)
assertText('apply_boolean_unary(curry_boolean_binary(and, true), false)', F)

assertText('negate_impl_a(true)', F)
assertText('negate_impl_a(false)', T)
assertText('negate_impl_b(true)', F)
assertText('negate_impl_b(false)', T)
assertText('negate_impl_a_alt(true)', F)
assertText('negate_impl_a_alt(false)', T)
assertText('negate_impl_b_alt(true)', F)
assertText('negate_impl_b_alt(false)', T)
assertText('negate_impl_one(true)', F)
assertText('negate_impl_one(false)', T)
assertText('negate_impl_two(true)', F)
assertText('negate_impl_two(false)', T)
assertText('negate_impl_three(true)', F)
assertText('negate_impl_three(false)', T)
assertText('negate_impl_one_alt(true)', F)
assertText('negate_impl_one_alt(false)', T)
assertText('negate_impl_two_alt(true)', F)
assertText('negate_impl_two_alt(false)', T)
assertText('negate_impl_three_alt(true)', F)
assertText('negate_impl_three_alt(false)', T)
assertText('if_boolean_switch(true, true, false)', F)
assertText('if_boolean_switch(true, false, true)', T)
assertText('if_boolean_switch(false, true, false)', T)
assertText('if_boolean_switch(false, false, true)', F)

assertText('lambda_negate(lambda_true)', 'lambda_tail')
assertText('lambda_negate(lambda_false)', 'lambda_head')

assertText('lambda_and(lambda_true, lambda_true)', 'lambda_head')
assertText('lambda_and(lambda_true, lambda_false)', 'lambda_tail')
assertText('lambda_and(lambda_false, lambda_true)', 'lambda_tail')
assertText('lambda_and(lambda_false, lambda_false)', 'lambda_tail')

assertText('lambda_nand(lambda_true, lambda_true)', 'lambda_tail')
assertText('lambda_nand(lambda_true, lambda_false)', 'lambda_head')
assertText('lambda_nand(lambda_false, lambda_false)', 'lambda_head')
assertText('lambda_nand(lambda_false, lambda_false)', 'lambda_head')

assertText('negate(true)', F)
assertText('negate(false)', T)
assertText('and(false, true)', F)
assertText('and(true, false)', F)
assertText('and(true, true)', T)
assertText('and(false, false)', F)
assertText(' and ( false , false )', F)
assertText(' and ( false , false )', F)
assertText(' and ( false , false )', F)
assertText('and(false,false)', F)
assertText('and(false,negate(false()))', F)
assertText('and(false(),false())', F)
assertText(' and (  false (  ) , false ( ) )', F)
assertText('apply_boolean_unary_negate_true', FF)

assertText('head([true, false])', T)
assertText('head(tail([true, false]))', F)
assertText(
  'find_first_element_with_condition(' +
    '[positive_integer("8"), positive_integer("2"),' +
     'positive_integer("18"), positive_integer("44"),' +
     'positive_integer("4")],' +
    'curry_right(greater, positive_integer("10")))',
  'positive_integer("18")'
)

assertText('argument_reference', 'type(argument_reference, [reference], write)')
assertText('boolean', 'type(boolean, [identity], name, [true, false])')

assertText('if',
  'function([condition, consequent, alternative], zobject, [Z31C1, Z31C2])')

assertText('or(true, true)', T)
assertText('or(true, false)', T)
assertText('or(false, true)', T)
assertText('or(false, false)', F)
assertText('xor(true, true)', F)
assertText('xor(true, false)', T)
assertText('xor(false, true)', T)
assertText('xor(false, false)', F)

assertText('nand(true, true)', F)
assertText('nand(true, false)', T)
assertText('nand(false, true)', T)
assertText('nand(false, false)', T)

assertText('negate(and(true, false))', T)
assertText('negate(and(true, true))', F)
assertText('negate(negate(true))', T)
assertText('negate(refer_to_one)', F)

assertText('if_boolean(false, false, false)', F)
assertText('if_boolean(false, false, true)', T)
assertText('if_boolean(false, true, false)', F)
assertText('if_boolean(false, true, true)', T)
assertText('if_boolean(true, false, false)', F)
assertText('if_boolean(true, false, true)', F)
assertText('if_boolean(true, true, false)', T)
assertText('if_boolean(true, true, true)', T)

assertText('negate(true)', F)
assertText('negate(false)', T)

assertText('kleenean',
  'type(kleenean, [identity], name, [kleenean_false_or_maybe], ' +
  '[kleenean_true, kleenean_true_or_maybe, kleenean_false])'
)
assertText('maybe', 'kleenean(maybe)')
raiseError('negate(maybe)', e.ARGUMENT_TYPE_MISMATCH)
raiseError('and(maybe, true)', e.ARGUMENT_TYPE_MISMATCH)
raiseError('and(true, maybe)', e.ARGUMENT_TYPE_MISMATCH)
raiseError('or(maybe, false)', e.ARGUMENT_TYPE_MISMATCH)
raiseError('or(maybe, maybe)', e.ARGUMENT_TYPE_MISMATCH)
assertText('kleenean_negate(maybe)', 'maybe')
assertText('kleenean_negate(kleenean_true)', 'kleenean_false')
assertText('kleenean_negate(boolean_to_kleenean(true))', 'kleenean_false')
assertText('kleenean_negate(boolean_to_kleenean(false))', 'kleenean_true')
assertText('kleenean_negate(kleenean_false)', 'kleenean_true')
assertText('boolean_to_kleenean_false', 'kleenean(kleenean_false)')
// TODO assertText('kleenean_negate(false)', 'kleenean_true') coercion
// TODO assertText('kleenean_negate(true)', 'kleenean_false') coercion

// TODO raiseError('kleenean_and(true, kleenean_true)', e.ARGUMENT_TYPE_MISMATCH)
raiseError('kleenean_and(true, kleenean_true)', e.ARGUMENT_TYPE_MISMATCH)

assertText('if_boolean_true_false_true', FF)
assertText('if_true_bad_alternative', TT)

assertText('same(true, true)', T)
assertText('same(true, false)', F)
assertText('same(false, true)', F)
assertText('same(false, false)', T)
assertText('same(and(true, true), true)', T)
assertText('same(maybe, true)', F) // no, not true. kleenean logic
assertText('same(true, negate)', F)
assertText('same(negate, negate)', T)
assertText('same(and, or)', F)
assertText('same(or, or)', T)
assertText('same(if_boolean, if)', T) // can go either way
assertText('same(boolean_to_kleenean(false), false)', F)
assertText('false', FF)
assertText('true', TT)
assertText('kleenean_true', 'kleenean(kleenean_true)')
assertText('kleenean_false', 'kleenean(kleenean_false)')
assertText('maybe', 'kleenean(maybe)')
assertText('same(true, negate(false))', T)
assertText('same(kleenean_true, true)', F)
assertText('same(kleenean_true, boolean_to_kleenean(true))', T)
assertText('same(kleenean_true, kleenean_true)', T)
assertText('same(maybe, maybe)', T)
assertText('same(kleenean_true, maybe)', F)
assertText('same(true, kleenean_true_or_maybe(kleenean_true))', T)
assertText('same(true, kleenean_true_or_maybe(boolean_to_kleenean(true)))', T)
assertText('kleenean_true_or_maybe(kleenean_true)', T)
assertText('kleenean_true_or_maybe(kleenean_false)', F)
assertText('kleenean_true_or_maybe(maybe)', T)
assertText('kleenean_false_or_maybe(maybe)', T)

assertText('kleenean_and(kleenean_true, kleenean_true)', 'kleenean_true')
assertText('kleenean_and(kleenean_true, maybe)', 'maybe')
assertText('kleenean_and(kleenean_true, kleenean_false)', 'kleenean_false')
assertText('kleenean_and(maybe, kleenean_true)', 'maybe')
assertText('kleenean_and(maybe, maybe)', 'maybe')
assertText('kleenean_and(maybe, kleenean_false)', 'kleenean_false')
assertText('kleenean_and(kleenean_false, kleenean_true)', 'kleenean_false')
assertText('kleenean_and(kleenean_false, maybe)', 'kleenean_false')
assertText('kleenean_and(kleenean_false, kleenean_false)', 'kleenean_false')

assertText('kleenean_or(kleenean_true, kleenean_true)', 'kleenean_true')
assertText('kleenean_or(kleenean_true, maybe)', 'kleenean_true')
assertText('kleenean_or(kleenean_true, kleenean_false)', 'kleenean_true')
assertText('kleenean_or(maybe, kleenean_true)', 'kleenean_true')
assertText('kleenean_or(maybe, maybe)', 'maybe')
assertText('kleenean_or(maybe, kleenean_false)', 'maybe')
assertText('kleenean_or(kleenean_false, kleenean_true)', 'kleenean_true')
assertText('kleenean_or(kleenean_false, maybe)', 'maybe')
assertText('kleenean_or(kleenean_false, kleenean_false)', 'kleenean_false')

assertText('kleenean_true_or_maybe(kleenean_true)', T)
assertText('kleenean_true_or_maybe(maybe)', T)
assertText('kleenean_true_or_maybe(kleenean_false)', F)
assertText('kleenean_false_or_maybe(kleenean_true)', F)
assertText('kleenean_false_or_maybe(maybe)', T)
assertText('kleenean_false_or_maybe(kleenean_false)', T)
assertText('and(kleenean_true_or_maybe(maybe), kleenean_false_or_maybe(maybe))', T)

assertText(
  'apply_boolean_unary(' +
  'curry_boolean_binary(and, true),' +
  'apply_boolean_unary(' +
    'curry_boolean_binary(xor, false),' +
    'apply_boolean_unary(' +
      'curry_boolean_binary(' +
        'or,' +
        'apply_boolean_unary(' +
          'curry_boolean_binary(and, true),' +
          'false' +
        ')' +
      '),' +
      'true' +
    ')' +
  ')' +
')', T)
assertText(
  'apply_boolean_unary(' +
  'curry_boolean_binary(and, true),' +
  'apply_boolean_unary(' +
    'curry_boolean_binary(xor, false),' +
    'apply_boolean_unary(' +
      'curry_boolean_binary(' +
        'or,' +
        'apply_boolean_unary(' +
          'curry_boolean_binary(and, true),' +
          'false' +
        ')' +
      '),' +
      'false' +
    ')' +
  ')' +
')', F)

assertText('nothing', 'type(nothing, [identity], write, nil)')
assertText('same(nothing, nothing)', T)
assertText('same(true, nothing)', F)
assertText('same(false, nothing)', F)
assertText('same(maybe, nothing)', F)
assertText('same(string("nothing"), nothing)', F)

assertText('string("true")', '"true"')
assertText('same(string("true"), true)', F)
assertText('same(string("different"), string("different"))', T)
assertText('same(string("different"), string("same"))', F)
assertText('string("test")', '"test"')
assertText('string("")', '""')
assertText('string(" ")', '" "')
assertText('string("λ")', '"λ"')
assertText('string("true test")', '"true test"')
assertText('string(";-;")', '";-;"')
assertText('string("Vrandečić")', '"Vrandečić"')
assertText('"\\""', '"\\""')
assertText('string_length("\\"")', 'positive_integer("1")')
assertText('"\\\\"', '"\\\\"')
assertText('string_length("\\\\")', 'positive_integer("1")')
assertText('"test"', '"test"')
assertText('""', '""')
assertText('" "', '" "')
assertText('"λ"', '"λ"')
assertText('"true test"', '"true test"')
assertText('";-;"', '";-;"')
assertText('"Vrandečić"', '"Vrandečić"')
assertText('project_name', '"eneyj"')
assertText('same(project_name, string("eneyj"))', T)
assertText('same(project_name, string("enejy"))', F)
assertText('same("test", string("test"))', T)
assertText('string_abc', '"ABC"')
assertText(
  'list_character_abc',
  '[character("A"), character("B"), character("C")]'
)

assertText('[]', '[]')
assertText('value(length([]))', 'positive_integer("0")')
assertText('length([])', 'zero') // incidental
assertText('id([])', 'nil') // incidental
assertText('value(id([]))', '[]')
assertText('value([])', '[]')
assertText('[one]', '[one]')
assertText('[one, two]', '[one, two]')
assertText('length([one])', 'positive_integer("1")')
assertText('length([one, two])', 'positive_integer("2")')
assertText('string_length("test")', 'positive_integer("4")')
assertText('length([nil])', 'positive_integer("1")')
assertText('length([[]])', 'positive_integer("1")')
assertText('length([nil, one])', 'positive_integer("2")')
assertText('length([[], []])', 'positive_integer("2")')
assertText('length([[]])', 'positive_integer("1")')
assertText('length([[[]]])', 'positive_integer("1")')
assertText('[[[]]]', '[[nil]]') // incidental
assertText('[one, [two, three], four]', '[one, [two, three], four]')

raiseError('()', e.SYNTAX_ERROR)
raiseError('(one)', e.SYNTAX_ERROR)
raiseError('one two', e.SYNTAX_ERROR)
raiseError('value one', e.SYNTAX_ERROR)
raiseError('one value', e.SYNTAX_ERROR)
raiseError('"test" string_length', e.SYNTAX_ERROR)
raiseError('"test"(one)', e.FUNCTION_CALL_CALLS_NON_FUNCTION)

assertText('character(" ")', 'character(" ")')
assertText('space', 'character(" ")')
assertText('character("a")', 'character("a")')
assertText('character("λ")', 'character("λ")')
assertText('character_a', 'character("a")')
assertText('character_sushi', 'character("🍣")')
// TODO the next one should be OK, but JSON Schema cannot count
raiseError('character_scientist', e.ERROR_IN_REFERENCE, e.JSON_SCHEMA_ERROR)
assertText(
  'length(string_to_characterlist(string_unicode_short))',
  'positive_integer("2")' // TODO should really be 1, not 2
)
assertText('same(character(" "), character(" "))', T)
assertText('same(space, character(" "))', T)
assertText('same(character("a"), character("a"))', T)
assertText('same(character("λ"), character("λ"))', T)
assertText('same(character("č"), character("č"))', T)
assertText('same(character("."), character("."))', T)
assertText('same(character("a"), character("A"))', F)
assertText('same(character("~"), character("a"))', F)
assertText('same(character("*"), character("a"))', F)
assertText('same(character("."), character("a"))', F)
assertText('same(character("a"), string("a"))', F)

assertText('name_not_found', 'name_not_found')
assertText('Z404', 'name_not_found')

raiseError('character("")', e.JSON_SCHEMA_ERROR)
raiseError('character("test")', e.JSON_SCHEMA_ERROR)
raiseError('character("<>")', e.JSON_SCHEMA_ERROR)

assertText('is_digit(character("0"))', T)
assertText('is_digit(character("1"))', T)
assertText('is_digit(character("2"))', T)
assertText('is_digit(character("3"))', T)
assertText('is_digit(character("4"))', T)
assertText('is_digit(character("5"))', T)
assertText('is_digit(character("6"))', T)
assertText('is_digit(character("7"))', T)
assertText('is_digit(character("8"))', T)
assertText('is_digit(character("9"))', T)
assertText('is_digit(character("o"))', F)
assertText('is_digit(character("O"))', F)
assertText('is_digit(character("I"))', F)
assertText('is_digit(character("a"))', F)
assertText('is_digit(character("+"))', F)
assertText('is_digit(character("V"))', F)

assertText('id(string("true"))', '"true"')
assertText('id("true")', '"true"')
assertText('id("  ")', '"  "')
raiseError('id(")', e.UNBALANCED_QUOTES)
raiseError('id("true\')', e.UNBALANCED_QUOTES)
assertText('id("a")', '"a"')
assertText('id("0")', '"0"')
assertText('id(" ")', '" "')
assertText('id(" a ")', '" a "')
raiseError('id(""")', e.UNBALANCED_QUOTES)
raiseError('id("""")', e.SYNTAX_ERROR)
raiseError('id(\'end\')', e.UNKNOWN_TOKEN)
raiseError('id("\\")', e.UNBALANCED_QUOTES)
raiseError('id("\\\')', e.INVALID_STRING_LITERAL)
raiseError('id("\\y")', e.INVALID_STRING_LITERAL)
assertText('id("\'")', '"\'"')
assertText('id("\\"")', '"\\""')
assertText('id("\\\\")', '"\\\\"')
raiseError('id("\\ ")', e.INVALID_STRING_LITERAL)
assertText('id("one")', '"one"')
assertText('id("positive_integer(\\"1\\")")', '"positive_integer(\\"1\\")"')

assertText('id(character("t"))', 'character("t")')
assertText('id(true)', T)
assertText('id(false)', F)
assertText('id(maybe)', 'maybe')
assertText('id(project_name)', 'project_name')
assertText('id(positive_integer("3"))', 'positive_integer("3")')
assertText('id(or(id(true), id(false)))', T)
assertText('id(xor(id(true), id(false)))', T)
assertText('negate(id(id(false)))', T)
assertText('apply(i_combinator, lambda_true)', 'lambda_head')

assertText('type_of(true)', 'boolean')
assertText('type_of(false)', 'boolean')
assertText('type_of(maybe)', 'kleenean')
assertText('type_of(true)', 'boolean')
assertText('type_of(kleenean_true)', 'kleenean')
assertText('type_of(character("t"))', 'character')
assertText('type_of(type_of)', 'function')
assertText('type_of(function)', 'type')
assertText('type_of(boolean)', 'type')
assertText('type_of(type)', 'type')

assertText('type_as_string(true)', '"Z50"')
assertText('type_as_string(false)', '"Z50"')
assertText('type_as_string(maybe)', '"Z170"')
assertText('type_as_string(true)', '"Z50"')
assertText('type_as_string(kleenean_true)', '"Z170"')
assertText('type_as_string(character("t"))', '"Z60"')
assertText('type_as_string(type_of)', '"Z8"')
assertText('type_as_string(function)', '"Z4"')
assertText('type_as_string(boolean)', '"Z4"')
assertText('type_as_string(type)', '"Z4"')

assertText('i_combinator', 'lambda(one, argument_reference("Z41K1"))')
assertText('i_combinator()', 'i_combinator')
assertText('i_combinator(i_combinator)', 'i_combinator')
assertText('i_combinator(i_combinator(i_combinator))', 'i_combinator')
assertText('identity_i_combinator_by_name',
  'lambda(one, argument_reference("Z41K1"))')
assertText('identity_i_combinator_by_position',
  'lambda(one, argument_reference("Z41K1"))')

assertText(
  'lambda_to_function(i_combinator)',
  'function([Z41K1], lambda, [implementation(argument_reference("Z41K1"))])'
)
assertText('lambda_to_function(i_combinator)(i_combinator)', 'i_combinator')

assertText('self_apply',
  'lambda(one, argument_reference("Z43K1")(argument_reference("Z43K1")))')
assertText('self_apply()', 'self_apply')
assertText('i_combinator(self_apply())', 'self_apply')
assertText('self_apply(i_combinator())', 'i_combinator')
assertText('self_apply(self_apply())', 'self_apply(self_apply)')

assertText('apply(i_combinator, self_apply)', 'self_apply')
assertText('apply(i_combinator, i_combinator)', 'i_combinator')

assertText('Z42(Z41, Z41)', 'i_combinator')
assertText('apply(Z41, Z41)', 'i_combinator')
assertText('Z42(i_combinator, i_combinator)', 'i_combinator')
assertText('apply(Z41, i_combinator)', 'i_combinator')
assertText('apply(i_combinator, Z41)', 'i_combinator')
assertText('Z42(i_combinator, Z41)', 'i_combinator')
assertText('Z41', 'lambda(one, argument_reference("Z41K1"))')

assertText('s_combinator(k_combinator, k_combinator, i_combinator)', 'i_combinator')
assertText('s_combinator(k_combinator, k_combinator, self_apply)', 'self_apply')
assertText('iota_combinator(iota_combinator)(i_combinator)', 'i_combinator')
assertText('iota_combinator(iota_combinator)(self_apply)', 'self_apply')

assertText('lambda_head(lambda_true, lambda_false)', 'lambda_head')
assertText('lambda_head(lambda_false, lambda_false)', 'lambda_tail')
assertText('lambda_head(lambda_true, lambda_true)', 'lambda_head')
assertText('lambda_head(lambda_false, lambda_true)', 'lambda_tail')
assertText('lambda_head(i_combinator, self_apply)', 'i_combinator')
assertText('lambda_head(self_apply, i_combinator)', 'self_apply')
assertText('lambda_tail(lambda_true, lambda_false)', 'lambda_tail')
assertText('lambda_tail(lambda_false, lambda_false)', 'lambda_tail')
assertText('lambda_tail(lambda_true, lambda_true)', 'lambda_head')
assertText('lambda_tail(lambda_false, lambda_true)', 'lambda_head')
assertText('lambda_tail(i_combinator, self_apply)', 'self_apply')
assertText('lambda_tail(self_apply, i_combinator)', 'i_combinator')
assertText('lambda_head(lambda_head, lambda_tail)', 'lambda_head')
assertText('lambda_tail(lambda_head, lambda_tail)', 'lambda_tail')

assertText('lambda_pair(lambda_true, lambda_false)(lambda_and)', 'lambda_tail')
// TODO assertText('lambda_pair(lambda_true, lambda_false)(lambda_or)', 'lambda_head')
assertText('lambda_pair(lambda_true, lambda_true)(lambda_and)', 'lambda_head')
// TODO assertText('lambda_pair(lambda_true, lambda_false)(lambda_xor)', 'lambda_tail')
assertText('lambda_pair(lambda_true, lambda_false)(lambda_head)', 'lambda_head')
assertText('lambda_pair(lambda_true, lambda_false)(lambda_tail)', 'lambda_tail')

assertText('if_lambda(lambda_true, true, false)', T)
assertText('if_lambda(lambda_false, true, false)', F)
assertText('if_lambda(lambda_true, true, negate(kleenean_and(maybe,maybe)))', T)
assertText('if_lambda(lambda_true, true, self_apply(omega_two_operator))', T)
// TODO leads to run time error, instead of an eneyj error
// raiseError('self_apply(omega_two_operator)', 'd')

assertText('k_combinator(lambda_true)(lambda_false)', 'lambda_head')
assertText('k_combinator(lambda_true)(lambda_true)', 'lambda_head')
assertText('k_combinator(lambda_false)(lambda_true)', 'lambda_tail')
assertText('k_combinator(lambda_true)',
  'function([K1], lambda, [implementation(lambda_true)])')
assertText('k_combinator(lambda_false)',
  'function([K1], lambda, [implementation(lambda_false)])')

assertText('lambda_is_zero(lambda_zero)', 'lambda_head')
assertText('lambda_is_zero(lambda_successor(lambda_zero))', 'lambda_tail')
assertText('lambda_is_zero(lambda_successor(lambda_one))', 'lambda_tail')
assertText('lambda_is_zero(lambda_one)', 'lambda_tail')
assertText('same(lambda_successor(lambda_zero), lambda_one)', T) // incidental?

assertText('lambda_is_zero(lambda_predecessor(lambda_one))', 'lambda_head')
assertText('lambda_is_zero(lambda_predecessor(lambda_zero))', 'lambda_head') // def
assertText(
  'lambda_is_zero(lambda_predecessor(lambda_successor(lambda_one)))', 'lambda_tail')
assertText('same(lambda_predecessor(lambda_one), lambda_zero)', T)
// incidental?

assertText('lambda_is_zero(lambda_add(' +
                             'lambda_zero, lambda_zero))', 'lambda_head')
assertText('lambda_is_zero(lambda_add(' +
                             'lambda_one, lambda_zero))', 'lambda_tail')
assertText('lambda_is_zero(lambda_predecessor(' +
                             'lambda_add(lambda_one, lambda_zero)))', 'lambda_head')
assertText('lambda_is_zero(lambda_predecessor(' +
                             'lambda_add(lambda_zero, lambda_one)))', 'lambda_head')
assertText(
  'lambda_is_zero(lambda_predecessor(lambda_predecessor(' +
                    'lambda_add(lambda_one, lambda_one))))', 'lambda_head')
assertText('lambda_is_zero(' +
                             'lambda_predecessor(lambda_predecessor(' +
                             'lambda_add(lambda_two, lambda_zero))))', 'lambda_head')
assertText('lambda_is_zero(' +
             'lambda_predecessor(lambda_predecessor(lambda_predecessor(' +
                                'lambda_add(lambda_two, lambda_one)))))', 'lambda_head')
assertText('lambda_to_boolean(lambda_true)', T)
assertText('lambda_to_boolean(lambda_false)', F)
assertText('lambda_to_boolean(i_combinator)', T) // TODO should be valid. error
assertText('lambda_to_boolean(lambda_is_zero)', T)
// TODO should be validation error
// raiseError('lambda_to_boolean(xor)', e.ARGUMENT_TYPE_MISMATCH) // should be
assertText('lambda_to_boolean(xor)', T) // TODO this should be the previous error
assertText('lambda_to_boolean(lambda_tail)', F) // this one is correct, though
assertText('lambda_to_boolean(lambda_head)', T) // this one is correct, though
// lambda tail and lambda false are indeed the same thing, just as head/true

assertText('lambda_if(boolean_to_lambda(true), true, false)', T)
assertText('lambda_if(boolean_to_lambda(false), true, false)', F)
assertText('lambda_if(boolean_to_lambda(true), false, true)', F)
assertText('lambda_if(boolean_to_lambda(false), false, true)', T)
assertText('lambda_if(lambda_true, lambda_true, lambda_false)', 'lambda_head')
assertText(
  'lambda_if(boolean_to_lambda(true), true, false)',
  T
) // TODO should be a validation error
// In fact, this would be a validation error, but if I treat it as such,
// I don't know how to lift from lambda_true to true :(
// there is now special code that allows this use case, which is bad
raiseError('lambda_if(lambda_true, true, false)', e.ARGUMENT_TYPE_MISMATCH)

assertText('lambda_is_zero(' +
            'positive_integer_to_lambda(positive_integer("0")))', 'lambda_head')
assertText('lambda_is_zero(' +
            'positive_integer_to_lambda(positive_integer("1")))', 'lambda_tail')
assertText('lambda_is_zero(lambda_predecessor(' +
            'positive_integer_to_lambda(positive_integer("1"))))', 'lambda_head')

assertText('lambda_to_positive_integer(lambda_zero)',
  'positive_integer("0")'
)
assertText('lambda_to_positive_integer(lambda_one)',
  'positive_integer("1")'
)
assertText('lambda_to_positive_integer(lambda_two)',
  'positive_integer("2")'
)
assertText('lambda_to_positive_integer(lambda_three)',
  'positive_integer("3")'
)
assertText('lambda_to_positive_integer(lambda_four)',
  'positive_integer("4")'
)
assertText('lambda_to_positive_integer(lambda_five)',
  'positive_integer("5")'
)
assertText('lambda_to_positive_integer(lambda_six)',
  'positive_integer("6")'
)
assertText('lambda_to_positive_integer(lambda_seven)',
  'positive_integer("7")'
)
assertText('lambda_to_positive_integer(lambda_eight)',
  'positive_integer("8")'
)
assertText('lambda_to_positive_integer(lambda_nine)',
  'positive_integer("9")'
)
assertText('lambda_to_positive_integer(lambda_ten)',
  'positive_integer("10")'
)
assertText(
  'lambda_to_positive_integer(lambda_successor(lambda_two))',
  'positive_integer("3")'
)

assertText(
  'lambda_to_positive_integer(positive_integer_to_lambda(' +
                               'positive_integer("0")))',
  'positive_integer("0")'
)
assertText(
  'lambda_to_positive_integer(positive_integer_to_lambda(' +
                               'positive_integer("1")))',
  'positive_integer("1")'
)
assertText(
  'lambda_to_positive_integer(positive_integer_to_lambda(' +
                               'positive_integer("2")))',
  'positive_integer("2")'
)
assertText(
  'lambda_to_positive_integer(positive_integer_to_lambda(' +
                               'positive_integer("3")))',
  'positive_integer("3")'
)
assertText(
  'lambda_to_positive_integer(positive_integer_to_lambda(' +
                               'positive_integer("4")))',
  'positive_integer("4")'
)
assertText(
  'lambda_to_positive_integer(positive_integer_to_lambda(' +
                               'positive_integer("5")))',
  'positive_integer("5")'
)
assertText(
  'lambda_to_positive_integer(positive_integer_to_lambda(' +
                               'positive_integer("6")))',
  'positive_integer("6")'
)
assertText(
  'lambda_to_positive_integer(positive_integer_to_lambda(' +
                               'positive_integer("7")))',
  'positive_integer("7")'
)
assertText(
  'lambda_to_positive_integer(positive_integer_to_lambda(' +
                               'positive_integer("8")))',
  'positive_integer("8")'
)
assertText(
  'lambda_to_positive_integer(positive_integer_to_lambda(' +
                               'positive_integer("9")))',
  'positive_integer("9")'
)
assertText(
  'lambda_to_positive_integer(positive_integer_to_lambda(' +
                               'positive_integer("10")))',
  'positive_integer("10")'
)

assertText(
  'lambda_to_positive_integer_zero_to_nine_single(positive_integer_to_lambda(' +
                                                 'positive_integer("0")))',
  'zero'
)
assertText(
  'lambda_to_positive_integer_zero_to_nine_single(positive_integer_to_lambda(' +
                                                 'positive_integer("1")))',
  'one'
)
assertText(
  'lambda_to_positive_integer_zero_to_nine_single(positive_integer_to_lambda(' +
                                                 'positive_integer("2")))',
  'two'
)
assertText(
  'lambda_to_positive_integer_zero_to_nine_single(positive_integer_to_lambda(' +
                                                 'positive_integer("3")))',
  'three'
)
assertText(
  'lambda_to_positive_integer_zero_to_nine_single(positive_integer_to_lambda(' +
                                                 'positive_integer("4")))',
  'four'
)
assertText(
  'lambda_to_positive_integer_zero_to_nine_single(positive_integer_to_lambda(' +
                                                 'positive_integer("5")))',
  'five'
)
assertText(
  'lambda_to_positive_integer_zero_to_nine_single(positive_integer_to_lambda(' +
                                                 'positive_integer("6")))',
  'six'
)
assertText(
  'lambda_to_positive_integer_zero_to_nine_single(positive_integer_to_lambda(' +
                                                 'positive_integer("7")))',
  'seven'
)
assertText(
  'lambda_to_positive_integer_zero_to_nine_single(positive_integer_to_lambda(' +
                                                 'positive_integer("8")))',
  'eight'
)
assertText(
  'lambda_to_positive_integer_zero_to_nine_single(positive_integer_to_lambda(' +
                                                 'positive_integer("9")))',
  'nine'
)
assertText(
  'lambda_to_positive_integer_zero_to_nine_single(' +
     'lambda_successor(positive_integer_to_lambda(positive_integer("9"))))',
  'value_overflow'
)

assertText('successor(positive_integer("0"))', 'positive_integer("1")')
assertText('successor(positive_integer("1"))', 'positive_integer("2")')
assertText('successor(positive_integer("2"))', 'positive_integer("3")')
assertText('successor(positive_integer("5"))', 'positive_integer("6")')
assertText('successor(positive_integer("9"))', 'positive_integer("10")')
/// the following is per definition
assertText('predecessor(positive_integer("0"))', 'positive_integer("0")')
assertText('predecessor(positive_integer("1"))', 'positive_integer("0")')
assertText('predecessor(positive_integer("2"))', 'positive_integer("1")')
assertText('predecessor(positive_integer("5"))', 'positive_integer("4")')
assertText('predecessor(positive_integer("9"))', 'positive_integer("8")')

assertText('zero', 'positive_integer("0")')
assertText('one', 'positive_integer("1")')
assertText('two', 'positive_integer("2")')
assertText('three', 'positive_integer("3")')
assertText('four', 'positive_integer("4")')
assertText('five', 'positive_integer("5")')
assertText('six', 'positive_integer("6")')
assertText('seven', 'positive_integer("7")')
assertText('eight', 'positive_integer("8")')
assertText('nine', 'positive_integer("9")')
assertText('ten', 'positive_integer("10")')
assertText('successor(one)', 'positive_integer("2")')
assertText('add(two, one)', 'positive_integer("3")')

assertText(
  'add(positive_integer("2"), positive_integer("2"))',
  'positive_integer("4")'
)
assertText(
  'add(positive_integer("2"), positive_integer("3"))',
  'positive_integer("5")'
)
assertText(
  'add(positive_integer("6"), positive_integer("0"))',
  'positive_integer("6")'
)
assertText(
  'add(positive_integer("0"), positive_integer("0"))',
  'positive_integer("0")'
)
assertText(
  'add(positive_integer("5"), positive_integer("4"))',
  'positive_integer("9")'
)
assertText(
  'add(positive_integer("5"), positive_integer("5"))',
  'positive_integer("10")'
)
assertText(
  'add(positive_integer("7"), positive_integer("5"))',
  'positive_integer("12")'
)
assertText(
  'add(positive_integer("12"), positive_integer("3"))',
  'positive_integer("15")'
)

assertText('add_s("2", "2")', 'positive_integer("4")')
assertText('add_s("2", "3")', 'positive_integer("5")')
assertText('add_s("6", "0")', 'positive_integer("6")')

assertText(
  'multiply(positive_integer("2"), positive_integer("3"))',
  'positive_integer("6")'
)
assertText(
  'multiply(positive_integer("3"), positive_integer("2"))',
  'positive_integer("6")'
)
assertText(
  'multiply(positive_integer("3"), positive_integer("3"))',
  'positive_integer("9")'
)
assertText(
  'multiply(positive_integer("4"), positive_integer("3"))',
  'positive_integer("12")'
)
assertText(
  'multiply(positive_integer("5"), positive_integer("0"))',
  'positive_integer("0")'
)
assertText(
  'multiply(positive_integer("0"), positive_integer("5"))',
  'positive_integer("0")'
)
assertText(
  'multiply(positive_integer("1"), positive_integer("1"))',
  'positive_integer("1")'
)
assertText(
  'multiply(positive_integer("1"), positive_integer("5"))',
  'positive_integer("5")'
)
assertText(
  'multiply(positive_integer("5"), positive_integer("1"))',
  'positive_integer("5")'
)
assertText(
  'lambda_to_positive_integer(y_combinator(lambda_multiply_single)' +
                            '(lambda_two, lambda_two))',
  'positive_integer("4")'
)
assertText(
  'lambda_to_positive_integer(y_combinator(lambda_multiply_single)' +
                            '(lambda_two, lambda_successor(lambda_two)))',
  'positive_integer("6")'
)
assertText(
  'lambda_to_positive_integer(y_combinator_recursive(lambda_multiply_single)' +
                            '(lambda_two, lambda_two))',
  'positive_integer("4")'
)
assertText(
  'lambda_to_positive_integer(y_combinator_recursive(lambda_multiply_single)' +
                            '(lambda_two, lambda_successor(lambda_two)))',
  'positive_integer("6")'
)
assertText(
  'lambda_to_positive_integer(y_combinator(lambda_add_single)' +
                            '(lambda_two, lambda_one))',
  'positive_integer("3")'
)
assertText(
  'lambda_to_positive_integer(y_combinator(lambda_add_single)' +
                            '(lambda_two, lambda_successor(lambda_two)))',
  'positive_integer("5")'
)
assertText(
  'lambda_to_positive_integer(y_combinator_recursive(lambda_add_single)' +
                            '(lambda_two, lambda_one))',
  'positive_integer("3")'
)
assertText(
  'lambda_to_positive_integer(y_combinator_recursive(lambda_add_single)' +
                            '(lambda_two, lambda_successor(lambda_two)))',
  'positive_integer("5")'
)
assertText(
  'lambda_to_positive_integer(y_combinator_recursive(lambda_power_single)' +
                            '(lambda_two, lambda_zero))',
  'positive_integer("1")'
)
assertText(
  'lambda_to_positive_integer(y_combinator_recursive(lambda_power_single)' +
                            '(lambda_two, lambda_one))',
  'positive_integer("2")'
)
assertText(
  'lambda_to_positive_integer(y_combinator_recursive(lambda_power_single)' +
                            '(lambda_two, lambda_two))',
  'positive_integer("4")'
)
assertText(
  'lambda_to_positive_integer(y_combinator_recursive(lambda_power_single)' +
                            '(lambda_two, lambda_successor(lambda_two)))',
  'positive_integer("8")'
)
assertText(
  'lambda_to_positive_integer(y_combinator_recursive(lambda_power_single)' +
                            '(lambda_successor(lambda_two), lambda_two))',
  'positive_integer("9")'
)
assertText(
  'lambda_to_positive_integer(y_combinator_recursive(' +
                             'lambda_natural_subtract_single)' +
                            '(lambda_successor(lambda_two), lambda_zero))',
  'positive_integer("3")'
)
assertText(
  'lambda_to_positive_integer(y_combinator_recursive(' +
                             'lambda_natural_subtract_single)' +
                            '(lambda_successor(lambda_two), lambda_one))',
  'positive_integer("2")'
)
assertText(
  'lambda_to_positive_integer(y_combinator_recursive(' +
                             'lambda_natural_subtract_single)' +
                            '(lambda_successor(lambda_two), lambda_two))',
  'positive_integer("1")'
)
assertText(
  'lambda_to_positive_integer(y_combinator_recursive(' +
                             'lambda_natural_subtract_single)' +
                            '(lambda_successor(lambda_two),' +
                             'lambda_successor(lambda_two)))',
  'positive_integer("0")'
)
assertText(
  'lambda_to_positive_integer(y_combinator_recursive(' +
                             'lambda_natural_subtract_single)' +
                            '(lambda_two, lambda_one))',
  'positive_integer("1")'
)
assertText(
  'lambda_to_positive_integer(y_combinator_recursive(' +
                             'lambda_natural_subtract_single)' +
                            '(lambda_one, lambda_one))',
  'positive_integer("0")'
)
assertText(
  'lambda_to_positive_integer(y_combinator_recursive(' +
                             'lambda_natural_subtract_single)' +
                            '(lambda_one, lambda_two))',
  'positive_integer("0")' // because it is a natural subtraction
)

assertText(
  'power(positive_integer("2"), positive_integer("0"))',
  'positive_integer("1")'
)
assertText(
  'power(positive_integer("2"), positive_integer("1"))',
  'positive_integer("2")'
)
assertText(
  'power(positive_integer("2"), positive_integer("2"))',
  'positive_integer("4")'
)
assertText(
  'power(positive_integer("2"), positive_integer("3"))',
  'positive_integer("8")'
)
assertText(
  'power(positive_integer("1"), positive_integer("0"))',
  'positive_integer("1")'
)
assertText(
  'power(positive_integer("1"), positive_integer("1"))',
  'positive_integer("1")'
)
assertText(
  'power(positive_integer("1"), positive_integer("2"))',
  'positive_integer("1")'
)
assertText(
  'power(positive_integer("1"), positive_integer("9"))',
  'positive_integer("1")'
)
assertText(
  'power(positive_integer("3"), positive_integer("2"))',
  'positive_integer("9")'
)
assertText(
  'power(positive_integer("0"), positive_integer("0"))',
  'positive_integer("1")'
)
assertText(
  'power(positive_integer("0"), positive_integer("1"))',
  'positive_integer("0")'
)
assertText(
  'power(positive_integer("2"), positive_integer("4"))',
  'positive_integer("16")'
)

assertText(
  'natural_subtract(positive_integer("6"), positive_integer("3"))',
  'positive_integer("3")'
)
assertText(
  'natural_subtract(positive_integer("9"), positive_integer("1"))',
  'positive_integer("8")'
)
assertText(
  'natural_subtract(positive_integer("7"), positive_integer("0"))',
  'positive_integer("7")'
)
assertText(
  'natural_subtract(positive_integer("3"), positive_integer("3"))',
  'positive_integer("0")'
)
assertText(
  'natural_subtract(positive_integer("2"), positive_integer("4"))',
  'positive_integer("0")' // per definition of natural subtraction
)

assertText('is_zero(positive_integer("0"))', T)
assertText('is_zero(positive_integer("1"))', F)
assertText('is_zero(positive_integer("2"))', F)
assertText('is_zero(positive_integer("8"))', F)
assertText('is_one(positive_integer("0"))', F)
assertText('is_one(positive_integer("1"))', T)
assertText('is_one(positive_integer("2"))', F)
assertText('is_one(positive_integer("8"))', F)

assertText(
  'equal_positive_integer(positive_integer("0"), positive_integer("0"))', T
)
assertText(
  'equal_positive_integer(positive_integer("1"), positive_integer("0"))', F
)
assertText(
  'equal_positive_integer(positive_integer("0"), positive_integer("1"))', F
)
assertText(
  'equal_positive_integer(positive_integer("1"), positive_integer("1"))', T
)
assertText(
  'equal_positive_integer(positive_integer("0"), positive_integer("7"))', F
)
assertText(
  'equal_positive_integer(positive_integer("7"), positive_integer("2"))', F
)
assertText(
  'equal_positive_integer(positive_integer("7"), positive_integer("7"))', T
)

assertText('lambda_greater(lambda_zero, lambda_zero)', 'lambda_tail')
assertText('lambda_greater(lambda_zero, lambda_five)', 'lambda_tail')
assertText('lambda_greater(lambda_five, lambda_zero)', 'lambda_head')
assertText('lambda_greater(lambda_five, lambda_five)', 'lambda_tail')
assertText('lambda_greater(lambda_five, lambda_two)', 'lambda_head')
assertText('lambda_greater(lambda_two, lambda_five)', 'lambda_tail')

assertText('lambda_less_or_equal(lambda_zero, lambda_zero)', 'lambda_head')
assertText('lambda_less_or_equal(lambda_zero, lambda_five)', 'lambda_head')
assertText('lambda_less_or_equal(lambda_five, lambda_zero)', 'lambda_tail')
assertText('lambda_less_or_equal(lambda_five, lambda_five)', 'lambda_head')
assertText('lambda_less_or_equal(lambda_five, lambda_two)', 'lambda_tail')
assertText('lambda_less_or_equal(lambda_two, lambda_five)', 'lambda_head')

assertText('greater(positive_integer("0"), positive_integer("0"))', F)
assertText('greater(positive_integer("5"), positive_integer("5"))', F)
assertText('greater(positive_integer("5"), positive_integer("3"))', T)
assertText('greater(positive_integer("5"), positive_integer("8"))', F)
assertText('greater(positive_integer("5"), positive_integer("0"))', T)
assertText('greater(positive_integer("0"), positive_integer("5"))', F)
assertText('greater_or_equal(positive_integer("0"), positive_integer("0"))', T)
assertText('greater_or_equal(positive_integer("5"), positive_integer("5"))', T)
assertText('greater_or_equal(positive_integer("5"), positive_integer("3"))', T)
assertText('greater_or_equal(positive_integer("5"), positive_integer("8"))', F)
assertText('greater_or_equal(positive_integer("5"), positive_integer("0"))', T)
assertText('greater_or_equal(positive_integer("0"), positive_integer("5"))', F)
assertText('less(positive_integer("0"), positive_integer("0"))', F)
assertText('less(positive_integer("5"), positive_integer("5"))', F)
assertText('less(positive_integer("5"), positive_integer("3"))', F)
assertText('less(positive_integer("5"), positive_integer("8"))', T)
assertText('less(positive_integer("5"), positive_integer("0"))', F)
assertText('less(positive_integer("0"), positive_integer("5"))', T)
assertText('less_or_equal(positive_integer("0"), positive_integer("0"))', T)
assertText('less_or_equal(positive_integer("5"), positive_integer("5"))', T)
assertText('less_or_equal(positive_integer("5"), positive_integer("3"))', F)
assertText('less_or_equal(positive_integer("5"), positive_integer("8"))', T)
assertText('less_or_equal(positive_integer("5"), positive_integer("0"))', F)
assertText('less_or_equal(positive_integer("0"), positive_integer("5"))', T)

assertText(
  'lambda_to_positive_integer_string(lambda_zero)',
  '"0"'
)
assertText(
  'lambda_to_positive_integer_string(lambda_one)',
  '"1"'
)
assertText(
  'lambda_to_positive_integer_string(lambda_ten)',
  '"10"'
)
assertText(
  'lambda_to_positive_integer_string(lambda_successor(lambda_ten))',
  '"11"'
)

assertText(
  'lambda_to_positive_integer(lambda_integer_division(lambda_seven, ' +
                                                     'lambda_eight))',
  'positive_integer("0")'
)
assertText(
  'lambda_to_positive_integer(lambda_integer_division(lambda_seven, ' +
                                                     'lambda_seven))',
  'positive_integer("1")'
)
assertText(
  'lambda_to_positive_integer(lambda_integer_division(lambda_seven, ' +
                                                     'lambda_four))',
  'positive_integer("1")'
)
assertText(
  'lambda_to_positive_integer(lambda_integer_division(lambda_seven, ' +
                                                     'lambda_three))',
  'positive_integer("2")'
)
assertText(
  'lambda_to_positive_integer(lambda_integer_division(lambda_seven, ' +
                                                     'lambda_two))',
  'positive_integer("3")'
)
assertText(
  'lambda_to_positive_integer(lambda_integer_division(lambda_seven, ' +
                                                     'lambda_one))',
  'positive_integer("7")'
)
assertText(
  'lambda_integer_division(lambda_seven, lambda_zero)',
  'division_by_zero'
)
assertText(
  'lambda_to_positive_integer(lambda_integer_division(lambda_zero, ' +
                                                     'lambda_seven))',
  'positive_integer("0")'
)
assertText(
  'lambda_integer_division(lambda_zero, lambda_zero)',
  'division_by_zero'
)

assertText(
  'integer_division(positive_integer("7"), positive_integer("8"))',
  'positive_integer("0")'
)
assertText(
  'integer_division(positive_integer("7"), positive_integer("7"))',
  'positive_integer("1")'
)
assertText(
  'integer_division(positive_integer("7"), positive_integer("4"))',
  'positive_integer("1")'
)
assertText(
  'integer_division(positive_integer("7"), positive_integer("3"))',
  'positive_integer("2")'
)
assertText(
  'integer_division(positive_integer("7"), positive_integer("2"))',
  'positive_integer("3")'
)
assertText(
  'integer_division(positive_integer("7"), positive_integer("1"))',
  'positive_integer("7")'
)
assertText(
  'integer_division(positive_integer("7"), positive_integer("0"))',
  'division_by_zero'
)
assertText(
  'integer_division(positive_integer("0"), positive_integer("7"))',
  'positive_integer("0")'
)
assertText(
  'integer_division(positive_integer("0"), positive_integer("0"))',
  'division_by_zero'
)

assertText(
  'lambda_to_positive_integer(lambda_modulo(lambda_seven, lambda_eight))',
  'positive_integer("7")'
)
assertText(
  'lambda_to_positive_integer(lambda_modulo(lambda_seven, lambda_seven))',
  'positive_integer("0")'
)
assertText(
  'lambda_to_positive_integer(lambda_modulo(lambda_seven, lambda_four))',
  'positive_integer("3")'
)
assertText(
  'lambda_to_positive_integer(lambda_modulo(lambda_seven, lambda_three))',
  'positive_integer("1")'
)
assertText(
  'lambda_to_positive_integer(lambda_modulo(lambda_seven, lambda_two))',
  'positive_integer("1")'
)
assertText(
  'lambda_to_positive_integer(lambda_modulo(lambda_seven, lambda_one))',
  'positive_integer("0")'
)
assertText(
  'lambda_modulo(lambda_seven, lambda_zero)',
  'division_by_zero'
)
assertText(
  'lambda_to_positive_integer(lambda_modulo(lambda_zero, lambda_seven))',
  'positive_integer("0")'
)
assertText(
  'lambda_modulo(lambda_zero, lambda_zero)',
  'division_by_zero'
)

assertText(
  'modulo(positive_integer("7"), positive_integer("8"))',
  'positive_integer("7")'
)
assertText(
  'modulo(positive_integer("7"), positive_integer("7"))',
  'positive_integer("0")'
)
assertText(
  'modulo(positive_integer("7"), positive_integer("4"))',
  'positive_integer("3")'
)
assertText(
  'modulo(positive_integer("7"), positive_integer("3"))',
  'positive_integer("1")'
)
assertText(
  'modulo(positive_integer("7"), positive_integer("2"))',
  'positive_integer("1")'
)
assertText(
  'modulo(positive_integer("7"), positive_integer("1"))',
  'positive_integer("0")'
)
assertText(
  'modulo(positive_integer("7"), positive_integer("0"))',
  'division_by_zero'
)
assertText(
  'modulo(positive_integer("0"), positive_integer("7"))',
  'positive_integer("0")'
)
assertText(
  'modulo(positive_integer("0"), positive_integer("0"))',
  'division_by_zero'
)

assertText('nil', '[]')
assertText('is_nil(nil)', T)
assertText('is_nil(Z300)', F)
assertText('is_nil(list_character_abc)', F)

assertText('head(Z300)', 'character("e")')
raiseError('head(true)', e.ARGUMENT_TYPE_MISMATCH)
assertText('head(list_character_abc)', 'character("A")')
assertText('head(tail(list_character_abc))', 'character("B")')
assertText('head(tail(tail(list_character_abc)))', 'character("C")')
raiseError('head(head(list_character_abc))', e.ARGUMENT_TYPE_MISMATCH)
assertText(
  'head(tail(tail(tail(list_character_abc))))',
  'list_is_nil'
)
assertText(
  'tail(tail(tail(tail(list_character_abc))))',
  'list_is_nil'
)
raiseError(
  'head(tail(tail(tail(tail(list_character_abc)))))',
  e.ARGUMENT_TYPE_MISMATCH
)

assertText('head(list(true, nil))', T)
assertText('is_nil(tail(list(true, nil)))', T)
assertText('head(list(character("A"), nil))', 'character("A")')
assertText('is_nil(tail(list(character("A"), nil)))', T)

assertText(
  'head(list(' +
    'character("A"), list(character("B"), list(character("C"), nil))))',
  'character("A")')
assertText(
  'head(tail(list(' +
    'character("A"), list(character("B"), list(character("C"), nil)))))',
  'character("B")')
assertText(
  'head(tail(tail(list(' +
    'character("A"), list(character("B"), list(character("C"), nil))))))',
  'character("C")')
raiseError(
  'head(head(list(' +
    'character("A"), list(character("B"), list(character("C"), nil)))))',
  e.ARGUMENT_TYPE_MISMATCH)
assertText(
  'head(tail(tail(tail(list(' +
    'character("A"), list(character("B"), list(character("C"), nil)))))))',
  'list_is_nil'
)
assertText(
  'tail(tail(tail(tail(list(' +
    'character("A"), list(character("B"), list(character("C"), nil)))))))',
  'list_is_nil'
)
raiseError(
  'head(tail(tail(tail(tail(list(' +
    'character("A"), list(character("B"), list(character("C"), nil))))))))',
  e.ARGUMENT_TYPE_MISMATCH
)

// TODO: this should be true, but same is not good enough
// assertText(
//  'same(' +
//    'list(character("A"), list(character("B"), list(character("C"), nil))),' +
//    'list_character_abc)',
//  T
// )

assertText('length(Z300)', 'positive_integer("5")')
assertText('length(list_character_abc)', 'positive_integer("3")')
assertText('length(nil)', 'zero')

assertText('length(append(nil, nil))', 'zero')
assertText(
  'length(append(nil, list_character_abc))',
  'positive_integer("3")'
)
assertText(
  'length(append(list_character_abc, nil))',
  'positive_integer("3")'
)
assertText(
  'length(append(list_character_abc, list_character_abc))',
  'positive_integer("6")'
)
assertText(
  'length(append(Z300, list_character_abc))',
  'positive_integer("8")'
)
assertText(
  'length(append(list_character_abc, ' +
                'append(list_character_abc, list_character_abc)))',
  'positive_integer("9")'
)
assertText(
  'head(append(Z300, list_character_abc))',
  'character("e")'
)
assertText(
  'head(append(list_character_abc, Z300))',
  'character("A")'
)
assertText(
  'head(tail(tail(tail(append(list_character_abc, ' +
                             'Z300)))))',
  'character("e")'
)

assertText('character_to_string(character("a"))', '"a"')
assertText('character_to_string(character("A"))', '"A"')
assertText('character_to_string(character("*"))', '"*"')
assertText('character_to_string(character("č"))', '"č"')
assertText('character_to_string(character(" "))', '" "')

assertText('concatenate(string("a"), string("b"))', '"ab"')
assertText('concatenate(string("a"), string(""))', '"a"')
assertText('concatenate(string(""), string(""))', '""')
assertText('concatenate(string(""), string("b"))', '"b"')
assertText('concatenate(string("a"), string("bc"))', '"abc"')
assertText('concatenate(string("ab"), string("c"))', '"abc"')
assertText('concatenate(string("ab"), string("cd"))', '"abcd"')
assertText('concatenate(string("a"), string(" "))', '"a "')

assertText(
  'concatenate(string("a"), concatenate(string(""), string("b")))',
  '"ab"'
)
assertText(
  'concatenate(concatenate(string(""), string("b")), string("a"))',
  '"ba"'
)

assertText('concatenate_list(Z358)', '"ABCDEFGHI"')
assertText('concatenate_list(tail(Z358))', '"DEFGHI"')
assertText('concatenate_list(nil)', '""')

assertText(
  'characterlist_to_string(list_character_abc)',
  '"ABC"'
)
assertText(
  'characterlist_to_string(Z300)',
  '"eneyj"'
)
assertText(
  'characterlist_to_string(append(list_character_abc, list_character_abc))',
  '"ABCABC"'
)
assertText(
  'characterlist_to_string(append(Z300, ' +
                                 'list_character_abc))',
  '"eneyjABC"'
)

assertText(
  'length(string_to_characterlist(string("abc")))',
  'positive_integer("3")'
)
assertText(
  'length(string_to_characterlist(project_name))',
  'positive_integer("5")'
)

assertText('string_length("abc")', 'positive_integer("3")')
assertText('string_length(project_name)', 'positive_integer("5")')
assertText('string_length("")', 'zero')

assertText('is_empty_string("abc")', F)
assertText('is_empty_string(project_name)', F)
assertText('is_empty_string("")', T)

assertText('head(string_to_characterlist(string("abc")))', 'character("a")')
assertText('head(string_to_characterlist(project_name))', 'character("e")')
assertText(
  'head(tail(string_to_characterlist(project_name)))',
  'character("n")'
)
assertText('head(string_to_characterlist(string("a")))', 'character("a")')
assertText('is_nil(tail(string_to_characterlist(string("a"))))', T)
assertText('is_nil(string_to_characterlist(string("")))', T)

assertText('pair_ab', 'pair(character("A"), character("B"))')
assertText('first(pair_ab)', 'character("A")')
assertText('second(pair_ab)', 'character("B")')
assertText(
  'first(pair(character("A"), character("B")))',
  'character("A")'
)
assertText(
  'second(pair(character("A"), character("B")))',
  'character("B")'
)

assertText('greater_or_equal(length(reify(true)), positive_integer("3"))', T)

assertText('abstract(reify(true))', T)
assertText('abstract(reify(false))', F)
assertText('abstract(reify(maybe))', 'maybe')
assertText('abstract(reify(pair_ab))', 'pair_ab')
assertText('abstract(reify(project_name))', 'project_name')
assertText('abstract(reify(positive_integer("3")))', 'positive_integer("3")')
assertText('abstract(reify(i_combinator))', 'i_combinator')
assertText('abstract(reify(is_zero))(positive_integer("0"))', T)
assertText(
  'select_text_by_language(abstract(reify(multilingual_text_en_word)), English)',
  'text_en_word'
)

assertText('abstract(abstract(reify(reify(true))))', T)
assertText('abstract(abstract(reify(reify(i_combinator))))', 'i_combinator')

assertText(
  'abstract(list(' +
    'pair(string("Z1K1"), string("Z70")), list(' +
    'pair(string("Z70K1"), string("512")), ' +
    'nil)))',
  'positive_integer("512")'
)

assertText(
  'find_second_by_first(' +
    'reify(positive_integer("4")),' +
    'string("Z70K1"))',
  '"4"'
)
assertText(
  'abstract(find_second_by_first(reify(pair_ab), string("Z2K1")))',
  'character("A")'
)

assertText('return_five(true)', 'positive_integer("5")')
assertText('return_five(i_combinator)', 'positive_integer("5")')
assertText('abstract(reify(return_five))(true)', 'positive_integer("5")')
assertText(
  'return_five',
  'function([arg], positive_integer, [Z335C1])'
)
// TODO: complete function calls get evaluated in the body, which leads to the
// same result, but looks different - which is why the following and the
// previous test don't have the same results.
// assertText(
//  'abstract(reify(return_five))',
//  'positive_integer return_five(zobject arg) → ' +
//    'add(positive_integer("2"), positive_integer("3"))'
// )
// Another way to say it is:
// assertReification('return_five')  // TODO

// for (let name of dataNamesAreValid) assertReification(name)  // TODO
assertReification('i_combinator')
// assertReification('lambda_less_or_equal')  // TODO
// One way to solve this would be to either introduce an eval of functions
// that evals complete function calls in the body - which kind of would make
// sense - or to compare not the results of the assertReification, but for
// assertReified functions to compare the results of the functions being run
// on the tests.
assertText('lambda_less_or_equal(lambda_one, lambda_two)', 'lambda_head')
assertText('abstract(reify(lambda_less_or_equal))' +
             '(lambda_one, lambda_two)', 'lambda_head')
assertText('lambda_less_or_equal(lambda_two, lambda_one)', 'lambda_tail')
assertText('abstract(reify(lambda_less_or_equal))' +
             '(lambda_two, lambda_one)', 'lambda_tail')

assertText('positive_integer_to_string(positive_integer("4"))', '"4"')
assertText('positive_integer_to_string(positive_integer("0"))', '"0"')
assertText('positive_integer_to_string(positive_integer("1"))', '"1"')
assertText('positive_integer_to_string(positive_integer("54"))', '"54"')

assertText('by_key(type_of, "Z8K2")', 'type')
assertText('by_key(same, "Z8K2")', 'boolean')
assertText('type_as_string(by_key(i_combinator, "Z40K1"))', '"Z70"')

assertText('has_key(project_name, "Z6K1")', T)
assertText('has_key(project_name, "Z6K2")', F)
assertText('has_key(i_combinator, "Z2")', F)

assertText('text_en_word', 'text(English, "word")')
assertText('text_de_wort', 'text(German, "Wort")')
assertText('language_code_from_language(English)', '"en"')
assertText('language_code_from_language(German)', '"de"')
assertText('language_code_from_text(text_en_word)', '"en"')
assertText('language_code_from_text(text_de_wort)', '"de"')
assertText('language_from_text(text_en_word)', 'English')
assertText('language_from_text(text_de_wort)', 'German')
assertText('text_to_string(text_en_word)', '"word"')
assertText('text_to_string(text_de_wort)', '"Wort"')

assertText(
  'select_text_by_language(multilingual_text_en_word, English)',
  'text_en_word'
)
assertText(
  'select_text_by_language(multilingual_text_en_word, German)',
  'language_not_found'
)
assertText(
  'select_text_by_language(multilingual_text_en_word, Croatian)',
  'language_not_found'
)
assertText(
  'select_text_by_language(multilingual_text_en_de_word, English)',
  'text_en_word'
)
assertText(
  'select_text_by_language(multilingual_text_en_de_word, German)',
  'text_de_wort'
)
assertText(
  'select_text_by_language(multilingual_text_en_de_word, Croatian)',
  'language_not_found'
)
assertText(
  'select_text_by_language(multilingual_text_word_no_ref, English)',
  'text(English, "word")'
)
assertText(
  'select_text_by_language(multilingual_text_word_no_ref, German)',
  'text(German, "Wort")'
)
assertText(
  'select_text_by_language(multilingual_text_word_no_ref, Croatian)',
  'language_not_found'
)

assertText(
  'English_singular',
  'language_feature(English_singular, English, English_grammatical_number)'
)
assertText(
  'string_from_table(' +
    'set_table_option(' +
      'noun_en_encyclopedia, English_singular))',
  '"encyclopedia"'
)
assertText(
  'string_from_table(' +
    'set_table_option(' +
      'noun_en_encyclopedia, English_plural))',
  '"encyclopedias"'
)
assertText(
  'string_from_table(' +
    'set_table_option(' +
      'set_table_option(' +
        'noun_de_enzyklopaedie, German_nominative), ' +
        'German_singular))',
  '"Enzyklopädie"'
)
assertText(
  'string_from_table(' +
    'set_table_option(' +
      'set_table_option(' +
        'noun_de_enzyklopaedie, German_genitive), ' +
        'German_plural))',
  '"Enzyklopädien"'
)
assertText(
  'string_from_table(' +
    'set_table_option(' +
      'det_en_indefinite_singular, English_vowel_startphoneme))',
  '"an"'
)
assertText(
  'string_from_table(' +
    'set_table_option(' +
      'det_en_indefinite_singular, English_consonant_startphoneme))',
  '"a"'
)
assertText(
  'string_from_table(det_de_bestimmt_einzahl)',
  'table_has_no_string'
)
assertText(
  'feature_from_table(noun_en_encyclopedia, English_startphoneme)',
  'English_vowel_startphoneme'
)
assertText(
  'feature_from_table(noun_de_enzyklopaedie, German_grammatical_gender)',
  'German_female_gender'
)
assertText(
  'feature_from_table(det_en_indefinite_singular, English_grammatical_number)',
  'English_singular'
)
assertText(
  'feature_from_table(np_en_an_encyclopedia, English_grammatical_number)',
  'English_singular'
)
assertText(
  'string_from_table(np_en_an_encyclopedia)',
  '"an encyclopedia"'
)

assertText(
  'string_from_table(' +
    'np_from_det_noun_en(det_en_indefinite_singular, noun_en_encyclopedia))',
  '"an encyclopedia"'
)
assertText(
  'string_from_table(' +
    'np_from_det_noun_en(det_en_definite_singular, noun_en_encyclopedia))',
  '"the encyclopedia"'
)
assertText(
  'string_from_table(' +
    'np_from_det_noun_en(det_en_some_plural, noun_en_encyclopedia))',
  '"some encyclopedias"'
)
assertText(
  'string_from_table(' +
    'np_from_det_noun_en(det_en_indefinite_singular, noun_en_rose))',
  '"a rose"'
)
assertText(
  'string_from_table(' +
    'np_from_det_noun_en(det_en_definite_singular, noun_en_rose))',
  '"the rose"'
)
assertText(
  'string_from_table(' +
    'np_from_det_noun_en(det_en_some_plural, noun_en_rose))',
  '"some roses"'
)

assertText(
  'string_from_table(' +
    'set_table_option(np_from_det_noun_de(det_de_manche, noun_de_buch), ' +
    'German_dative))',
  '"manchen Büchern"'
)
assertText(
  'string_from_table(' +
    'set_table_option(np_from_det_noun_de(det_de_unbestimmt_einzahl, noun_de_rose), ' +
    'German_accusative))',
  '"eine Rose"'
)
assertText(
  'string_from_table(' +
    'set_table_option(np_from_det_noun_de(det_de_bestimmt_einzahl, noun_de_planet), ' +
    'German_genitive))',
  '"des Planeten"'
)
raiseError(
  'np_from_det_noun_de_single_case(' +
    'det_de_zwei, person_de_marie_curie, German_nominative)',
  e.ERROR_IN_ARGUMENT
)
raiseError(
  'set_table_option(' +
    'np_from_det_noun_de(det_de_zwei, person_de_marie_curie), ' +
    'German_genitive)',
  e.ERROR_IN_ARGUMENT
)

assertText('put_in_parentheses(string("inside"))', '"(inside)"')
assertText('put_in_parentheses(put_in_parentheses(string("o")))', '"((o))"')

// assertText('concatenate_with_exception(string("a"))', 'intentional') // TODO should make an error

assertText(
  'dimension_from_feature(English_plural)',
  'English_grammatical_number'
)
assertText(
  'dimension_from_feature(German_accusative)',
  'German_grammatical_case'
)

assertText('name(type, English)', '"type"')
assertText('name(type, German)', '"Typ"')
assertText('name(Z41, English)', '"i_combinator"')
assertText('name(i_combinator, English)', '"i_combinator"')
assertText('name(Z41, German)', '"I_Kombinator"')
assertText('name(i_combinator, German)', '"I_Kombinator"')
assertText('name(English, English)', '"English"')
assertText('name(English, German)', '"Englisch"')
assertText('name(German, English)', '"German"')
assertText('name(German, German)', '"Deutsch"')
assertText('name(pair_ab, English)', '"pair_ab"')
assertText('name(add, English)', '"add"')

assertText('language_has_language_code(English, "en")', T)
assertText('language_has_language_code(English, "de")', F)
assertText('language_has_language_code(English, "asdf")', F)
assertText('language_has_language_code(German, "en")', F)
assertText('language_has_language_code(German, "de")', T)

assertText('language_has_language_code_curry("en")(English)', T)
assertText('language_has_language_code_curry("en")(German)', F)
assertText('language_has_language_code_curry("de")(English)', F)
assertText('language_has_language_code_curry("de")(German)', T)
assertText('language_has_language_code_curry("asdf")(English)', F)
assertText('language_has_language_code_curry("asdf")(German)', F)

assertText('all_values(boolean)', '[true, false]')

assertText('language_by_code("en")', 'English')
assertText('language_by_code("de")', 'German')
assertText('language_by_code("hr")', 'Croatian')
assertText('language_by_code("en-gb")', 'British_English')
assertText('language_by_code(language_code_from_language(English))', 'English')
assertText(
  'language_by_code("asdf")',
  'no_element_fulfilling_condition_found'
)

assertText('any(string_to_characterlist("1001"), is_digit)', T)
assertText('any(string_to_characterlist("I00I"), is_digit)', T)
assertText('any(string_to_characterlist("IOOI"), is_digit)', F)
assertText('all(string_to_characterlist("1001"), is_digit)', T)
assertText('all(string_to_characterlist("I00I"), is_digit)', F)
assertText('all(string_to_characterlist("IOOI"), is_digit)', F)

assertText('is_language_code("en")', T)
assertText('is_language_code("de")', T)
assertText('is_language_code("en-gb")', T)
assertText('is_language_code("asdf")', F)

assertText(
  'language_feature_is_of_dimension(English_plural, English_grammatical_number)',
  T)
assertText(
  'language_feature_is_of_dimension(English_plural, English_grammatical_gender)',
  F)
assertText(
  'language_feature_is_of_dimension(German_plural, German_grammatical_number)',
  T)
assertText(
  'language_feature_is_of_dimension(German_plural, English_grammatical_number)',
  F)

assertText(
  'language_feature_is_of_dimension_curry(English_grammatical_number)(English_plural)',
  T)
assertText(
  'language_feature_is_of_dimension_curry(English_grammatical_gender)(English_plural)',
  F)
assertText(
  'language_feature_is_of_dimension_curry(German_grammatical_number)(German_plural)',
  T)
assertText(
  'language_feature_is_of_dimension_curry(English_grammatical_number)(German_plural)',
  F)

assertText(
  'feature_from_table(det_en_indefinite_singular, English_grammatical_number)',
  'English_singular')
assertText(
  'feature_from_table(det_en_indefinite_singular, English_grammatical_gender)',
  'no_element_fulfilling_condition_found')
assertText(
  'feature_from_table(det_de_bestimmt_einzahl, German_grammatical_number)',
  'German_singular')

assertText('list_string_abcdefghi', '["ABC", "DEF", "GHI"]')
assertText(
  'map(map(list_string_abcdefghi, string_to_characterlist), length)',
  '[positive_integer("3"), positive_integer("3"), positive_integer("3")]'
)
assertText(
  'reduce(' +
    'map(map(list_string_abcdefghi, string_to_characterlist), length), ' +
    'add, ' +
    'positive_integer("0"))',
  'positive_integer("9")'
)
assertText(
  'characterlist_to_string(filter(string_to_characterlist("1a23c"), is_digit))',
  '"123"'
)

assertText(
  'curry_left(modulo, positive_integer("6"))(positive_integer("4"))',
  'positive_integer("2")'
)
assertText(
  'curry_right(modulo, positive_integer("6"))(positive_integer("4"))',
  'positive_integer("4")'
)
assertText('curry_left(same, "test")("test")', T)
assertText('curry_right(same, "test")("test")', T)
assertText('curry_left(same, "test")("asdf")', F)

assertText('table_has_feature(det_en_indefinite_singular, English_singular)', T)
assertText('table_has_feature(det_en_indefinite_singular, English_plural)', F)
assertText('table_has_feature(det_de_bestimmt_einzahl, German_singular)', T)
assertText('table_has_feature(det_de_bestimmt_einzahl, German_plural)', F)
assertText('table_has_feature(det_de_bestimmt_einzahl, English_singular)', F)

assertText(
  'length(filter_options_by_feature(det_en_indefinite_singular, English_consonant_startphoneme))',
  'positive_integer("1")')
assertText(
  'length(filter_options_by_feature(det_en_indefinite_singular, English_plural))',
  'zero')
assertText(
  'length(options_from_table(det_de_bestimmt_einzahl))',
  'positive_integer("12")'
)
assertText(
  'length(filter_options_by_feature(det_de_bestimmt_einzahl, German_accusative))',
  'positive_integer("3")')
assertText(
  'length(filter_options_by_feature(det_de_bestimmt_einzahl, German_female_gender))',
  'positive_integer("4")')
assertText(
  'length(filter_options_by_feature(det_de_bestimmt_einzahl, German_plural))',
  'zero')
assertText(
  'length(filter_options_by_feature(det_de_bestimmt_einzahl, English_plural))',
  'zero')

assertText('language_from_table(det_en_indefinite_singular)', 'English')
assertText('language_from_table(det_en_indefinite_singular)', 'English')
assertText('language_from_table(noun_en_book)', 'English')
assertText('language_from_table(det_de_unbestimmt_einzahl)', 'German')

assertText(
  'string_from_table(set_table_option(det_en_indefinite_singular, English_vowel_startphoneme))',
  '"an"'
)
assertText(
  'string_from_table(set_table_option(det_en_indefinite_singular, English_consonant_startphoneme))',
  '"a"'
)
assertText(
  'language_from_table(set_table_option(det_en_indefinite_singular, English_consonant_startphoneme))',
  'English'
)
assertText(
  'string_from_table(' +
    'set_table_option(' +
      'set_table_option(' +
        'det_de_bestimmt_einzahl, German_nominative),' +
      'German_female_gender))',
  '"die"'
)
assertText(
  'string_from_table(' +
    'set_table_option(' +
      'set_table_option(' +
        'det_de_bestimmt_einzahl, German_female_gender),' +
      'German_nominative))',
  '"die"'
)

assertText(
  'chain(successor, curry_right(modulo, positive_integer("7")))(positive_integer("6"))',
  'positive_integer("0")'
)
assertText(
  'chain(curry_right(modulo, positive_integer("7")), successor)(positive_integer("6"))',
  'positive_integer("7")'
)
assertText(
  'modulo(positive_integer("2"), positive_integer("3"))',
  'positive_integer("2")'
)
assertText(
  'switch_left_and_right(modulo)(positive_integer("2"), positive_integer("3"))',
  'positive_integer("1")'
)

assertText('spaced_concatenate("a", "a")', '"a a"')
assertText('spaced_concatenate("a", "")', '"a"')
assertText('spaced_concatenate("", "b")', '"b"')
assertText('spaced_concatenate("", "")', '""')

assertText(
  'string_from_table(' +
    'np_from_det_noun_en(det_en_indefinite_plural, noun_en_rose))',
  '"roses"'
)
assertText(
  'string_from_table(set_table_option(' +
    'np_from_det_noun_de(det_de_unbestimmt_mehrzahl, noun_de_rose),' +
    'German_genitive))',
  '"Rosen"'
)
assertText(
  'string_from_table(set_table_option(' +
    'vp_from_np_en(np_from_det_noun_en(' +
      'det_en_indefinite_singular, noun_en_cat)), ' +
    'English_singular))',
  '"is a cat"'
)
assertText(
  'string_from_table(set_table_option(' +
    'vp_from_np_en(np_from_det_noun_en(' +
      'det_en_indefinite_plural, noun_en_cat)), ' +
    'English_plural))',
  '"are cats"'
)
assertText(
  'string_from_table(set_table_option(' +
    'vp_from_np_de(np_from_det_noun_de(' +
      'det_de_unbestimmt_einzahl, noun_de_katze)), ' +
    'German_singular))',
  '"ist eine Katze"'
)
assertText(
  'string_from_table(clause_from_np_vp_en(' +
    'np_from_det_noun_en(' +
      'det_en_indefinite_singular, noun_en_encyclopedia),' +
    'set_table_option(' +
      'vp_from_np_en(np_from_det_noun_en(' +
        'det_en_indefinite_singular, noun_en_book)), ' +
      'English_singular)))',
  '"an encyclopedia is a book"'
)
assertText(
  'string_from_table(clause_from_np_vp_de(' +
    'np_from_det_noun_de(' +
      'det_de_unbestimmt_einzahl, noun_de_enzyklopaedie), ' +
    'vp_from_np_de(np_from_det_noun_de(' +
      'det_de_unbestimmt_einzahl, noun_de_buch))))',
  '"eine Enzyklopädie ist ein Buch"'
)
assertText(
  'string_from_table(clause_from_np_np_en(' +
    'np_from_det_noun_en(' +
      'det_en_indefinite_singular, noun_en_encyclopedia),' +
    'np_from_det_noun_en(' +
      'det_en_indefinite_singular, noun_en_book)))',
  '"an encyclopedia is a book"'
)
assertText(
  'string_from_table(clause_from_np_np_de(' +
    'np_from_det_noun_de(' +
      'det_de_unbestimmt_einzahl, noun_de_enzyklopaedie), ' +
    'np_from_det_noun_de(' +
      'det_de_unbestimmt_einzahl, noun_de_buch)))',
  '"eine Enzyklopädie ist ein Buch"'
)

assertText(
  'add_fullstop(string_from_table(clause_from_np_np_en(' +
    'np_from_det_noun_en(' +
      'det_en_indefinite_singular, noun_en_encyclopedia),' +
    'np_from_det_noun_en(' +
      'det_en_indefinite_singular, noun_en_book))))',
  '"an encyclopedia is a book."'
)
assertText('add_fullstop("Hello")', '"Hello."')
assertText('add_fullstop(string_abc)', '"ABC."')
assertText('add_fullstop("")', '"."')
assertText('add_fullstop(".")', '".."')
assertText('add_fullstop(" ")', '" ."')
assertText('add_fullstop("A")', '"A."')

assertText('first_character_of_string("Hello")', 'character("H")')
assertText('first_character_of_string("hello")', 'character("h")')
assertText('first_character_of_string(string_abc)', 'character("A")')
assertText('first_character_of_string("a")', 'character("a")')
assertText('first_character_of_string(" ")', 'character(" ")')
assertText('first_character_of_string(".")', 'character(".")')
assertText('first_character_of_string("")', 'list_is_nil')

assertText('string_without_first_character("Hello")', '"ello"')
assertText('string_without_first_character("Hello world")', '"ello world"')
assertText('string_without_first_character("HELLO")', '"ELLO"')
assertText('string_without_first_character(string_abc)', '"BC"')
assertText('string_without_first_character("a")', '""')
assertText('string_without_first_character(" ")', '""')
assertText('string_without_first_character("")', 'list_is_nil')

assertText('is_first(character("A"), pair_ab)', T)
assertText('is_first(character("B"), pair_ab)', F)
assertText('is_first("", pair("", ""))', T)
assertText('is_first(false, pair(false, true))', T)
assertText('is_first(true, pair(false, true))', F)
assertText('is_first(true, pair(true, ""))', T)
assertText('is_first("", pair(true, ""))', F)

assertText('is_first_predicate(character("A"))(pair_ab)', T)
assertText('is_first_predicate(character("B"))(pair_ab)', F)
assertText('is_first_predicate("")(pair("", ""))', T)
assertText('is_first_predicate(false)(pair(false, true))', T)
assertText('is_first_predicate(true)(pair(false, true))', F)
assertText('is_first_predicate(true)(pair(true, ""))', T)
assertText('is_first_predicate("")(pair(true, ""))', F)

assertText(
  'is_exception(find_second_by_first(capitalization_map, character("A")))',
  T
)
assertText(
  'is_exception(find_second_by_first(capitalization_map, character("a")))',
  F
)
assertText(
  'is_exception(integer_division(positive_integer("3"), positive_integer("0")))',
  T
)
assertText(
  'is_exception(integer_division(positive_integer("3"), positive_integer("1")))',
  F
)

assertText(
  'try_else(' +
    'integer_division(positive_integer("3"), positive_integer("0")),' +
    'positive_integer("0"))',
  'positive_integer("0")'
)
assertText(
  'try_else(' +
    'integer_division(positive_integer("3"), positive_integer("1")),' +
    'positive_integer("0"))',
  'positive_integer("3")'
)

assertText('capitalize_character(character_a)', 'character("A")')
assertText('capitalize_character(character("a"))', 'character("A")')
assertText('capitalize_character(character("A"))', 'character("A")')
assertText('capitalize_character(character("*"))', 'character("*")')
assertText('capitalize_character(character_sushi)', 'character_sushi')

assertText('capitalize(project_name)', '"Eneyj"')
assertText('capitalize("hello")', '"Hello"')
assertText('capitalize("Hello")', '"Hello"')
assertText('capitalize("hello world")', '"Hello world"')
assertText('capitalize("")', 'empty_string')

assertText('is_of_type(type, type)', T)
assertText('is_of_type(lambda, i_combinator)', T)
assertText('is_of_type(function, add)', T)
assertText('is_of_type(type, i_combinator)', F)
assertText('is_of_type(boolean, true)', T)
assertText('is_of_type(string, true)', F)
assertText('is_of_type(string, "true")', T)

assertText('return_type(nand)', 'boolean')
assertText('return_type(return_type)', 'type')
assertText('return_type(multiply)', 'positive_integer')
raiseError('return_type(type)', e.ARGUMENT_TYPE_MISMATCH)

assertText(
  'curry_chain_left(same, number_of_parameter, positive_integer("1"))(id)',
  T
)
assertText(
  'curry_chain_left(same, number_of_parameter, positive_integer("2"))(id)',
  F
)

assertText(
  'keys(one)',
  '["Z1K1", "Z1K2", "Z1K3", "Z70K1"]'
)

assertText(
  'string_from_table(sentence_from_clause_en(clause_from_np_np_en(' +
    'person_en_marie_curie, ' +
    'np_from_det_noun_en(det_en_indefinite_singular, noun_en_person))))',
  '"Marie Curie is a person."'
)
assertText(
  'string_from_table(sentence_from_clause_de(clause_from_np_np_de(' +
    'person_de_marie_curie, ' +
    'np_from_det_noun_de(det_de_unbestimmt_einzahl, noun_de_person))))',
  '"Marie Curie ist eine Person."'
)

assertText(
  'string_from_table(sentence_from_clause_en(clause_from_np_np_en(' +
    'pn_from_noun_en(noun_en_wikipedia), ' +
    'np_from_det_noun_en(det_en_indefinite_singular, noun_en_encyclopedia))))',
  '"Wikipedia is an encyclopedia."'
)

assertText(
  'string_from_table(sentence_from_clause_de(clause_from_np_np_de(' +
    'pn_from_noun_de(noun_de_wikipedia), ' +
    'np_from_det_noun_de(det_de_unbestimmt_einzahl, noun_de_enzyklopaedie))))',
  '"Wikipedia ist eine Enzyklopädie."'
)

assertText(
  'string_from_table(sentence_from_clause_de(clause_from_np_np_de(' +
    'np_from_det_noun_de(det_de_unbestimmt_mehrzahl, noun_de_rose), ' +
    'np_from_det_noun_de(det_de_unbestimmt_einzahl, noun_de_wissenschaft))))',
  '"Rosen sind eine Wissenschaft."'
)

assertText(
  'string_from_table(sentence_from_clause_en(' +
    'clause_from_np_np_en(np_from_det_noun_en(' +
        'det_en_indefinite_singular, noun_en_encyclopedia),' +
      'np_from_det_noun_en(' +
        'det_en_indefinite_singular, noun_en_book))))',
  '"An encyclopedia is a book."'
)
assertText(
  'string_from_table(sentence_from_clause_de(' +
    'clause_from_np_np_de(np_from_det_noun_de(' +
      'det_de_unbestimmt_einzahl, noun_de_enzyklopaedie),' +
    'np_from_det_noun_de(' +
      'det_de_unbestimmt_einzahl, noun_de_buch))))',
  '"Eine Enzyklopädie ist ein Buch."'
)
assertText(
  'string_from_table(sentence_from_clause_en(' +
    'clause_from_np_np_en(np_from_det_noun_en(' +
        'det_en_indefinite_plural, noun_en_encyclopedia),' +
      'np_from_det_noun_en(' +
        'det_en_indefinite_plural, noun_en_book))))',
  '"Encyclopedias are books."'
)
assertText(
  'string_from_table(sentence_from_clause_de(' +
    'clause_from_np_np_de(np_from_det_noun_de(' +
      'det_de_unbestimmt_mehrzahl, noun_de_enzyklopaedie),' +
    'np_from_det_noun_de(' +
      'det_de_unbestimmt_mehrzahl, noun_de_buch))))',
  '"Enzyklopädien sind Bücher."'
)
assertText(
  'string_from_table(sentence_from_clause_en(' +
    'subclassification_from_n_n_en(' +
        'noun_en_encyclopedia, noun_en_book)))',
  '"Encyclopedias are books."'
)
assertText(
  'string_from_table(sentence_from_clause_de(' +
    'subclassification_from_n_n_de(' +
      'noun_de_enzyklopaedie, noun_de_buch)))',
  '"Enzyklopädien sind Bücher."'
)

assertText(
  'by_key(Z523, "Z500K2")',
  '[slot_instantiation("Z522K1", n_encyclopedia), ' +
   'slot_instantiation("Z522K2", n_book)]'
)

assertText('language_is_english(English, empty_context)', T)
assertText('language_is_english(German, empty_context)', F)
assertText('language_is_german(English, empty_context)', F)
assertText('language_is_german(German, empty_context)', T)

assertText(
  'function_if_test(conditional_function_example, English, empty_context)',
  'subclassification_from_n_n_en'
)
assertText(
  'string_from_table(sentence_from_clause_en(' +
    'function_if_test(conditional_function_example, English, empty_context)' +
      '(noun_en_encyclopedia, noun_en_book)))',
  '"Encyclopedias are books."'
)

assertText(
  'try_until_function(' +
    'list(conditional_function_example,' +
    'list(conditional_function(' +
      'language_is_german, ' +
      'subclassification_from_n_n_de), ' +
    'list(list_is_nil, list_is_nil))), ' +
    'English, empty_context)',
  'subclassification_from_n_n_en'
)
assertText(
  'try_until_function(' +
    'list(conditional_function_example,' +
    'list(conditional_function(' +
      'language_is_german, ' +
      'subclassification_from_n_n_de), ' +
    'list(list_is_nil, list_is_nil))), ' +
    'German, empty_context)',
  'subclassification_from_n_n_de'
)
assertText(
  'try_until_function(' +
    'list(conditional_function_example,' +
    'list(conditional_function(' +
      'language_is_german, ' +
      'subclassification_from_n_n_de), ' +
    'list(list_is_nil, list_is_nil))), ' +
    'Croatian, empty_context)',
  'nothing'
)

assertText(
  'string_from_table(try_until_function(' +
    'list(conditional_function(' +
      'language_is_english, sentence_from_clause_en), ' +
    'list(conditional_function(' +
      'language_is_german, sentence_from_clause_de), ' +
    'list(list_is_nil, list_is_nil))), ' +
    'English, empty_context)' +
     '(try_until_function(' +
       'list(conditional_function_example, ' +
       'list(conditional_function(' +
         'language_is_german, subclassification_from_n_n_de), ' +
        'list(list_is_nil, list_is_nil))), ' +
        'English, empty_context)' +
         '(noun_en_book, noun_en_rose)))',
  '"Books are roses."'
)
assertText(
  'string_from_table(try_until_function(' +
    'list(conditional_function(' +
      'language_is_english, sentence_from_clause_en), ' +
    'list(conditional_function(' +
      'language_is_german, sentence_from_clause_de), ' +
    'list(list_is_nil, list_is_nil))), ' +
    'German, empty_context)' +
     '(try_until_function(' +
       'list(conditional_function_example, ' +
       'list(conditional_function(' +
         'language_is_german, subclassification_from_n_n_de), ' +
        'list(list_is_nil, list_is_nil))), ' +
        'German, empty_context)' +
         '(noun_de_buch, noun_de_rose)))',
  '"Bücher sind Rosen."'
)

assertText(
  'string_from_table(try_until_function(' +
    'conditional_functions_sentence_from_clause, ' +
    'German, empty_context)' +
     '(try_until_function(' +
       'conditional_functions_subclassification, ' +
        'German, empty_context)' +
         '(noun_de_buch, noun_de_rose)))',
  '"Bücher sind Rosen."'
)

assertText(
  'find_table_by_language_in_list(' +
    'list(noun_en_book, ' +
    'list(noun_de_buch, ' +
    'list(list_is_nil, list_is_nil))), ' +
    'English)',
  'noun_en_book'
)
assertText(
  'find_table_by_language_in_list(' +
    'list(noun_en_book, ' +
    'list(noun_de_buch, ' +
    'list(list_is_nil, list_is_nil))), ' +
    'German)',
  'noun_de_buch'
)
assertText(
  'find_table_by_language_in_list(' +
    'list(noun_en_book, ' +
    'list(noun_de_buch, ' +
    'list(list_is_nil, list_is_nil))), ' +
    'Croatian)',
  'language_not_found'
)

assertText(
  'find_table_by_language_in_list(list_of_tables_for_book, English)',
  'noun_en_book'
)
assertText(
  'find_table_by_language_in_list(list_of_tables_for_book, German)',
  'noun_de_buch'
)
assertText(
  'find_table_by_language_in_list(list_of_tables_for_book, Croatian)',
  'language_not_found'
)

assertText(
  'find_table_by_language_in_list(by_key(n_book, "Z501K3"), English)',
  'noun_en_book'
)
assertText(
  'find_table_by_language_in_list(by_key(n_book, "Z501K3"), German)',
  'noun_de_buch'
)
assertText(
  'find_table_by_language_in_list(by_key(n_book, "Z501K3"), Croatian)',
  'language_not_found'
)

assertText(
  'table_by_language_from_construktor(n_book, English)',
  'noun_en_book'
)
assertText(
  'table_by_language_from_construktor(n_book, German)',
  'noun_de_buch'
)
assertText(
  'table_by_language_from_construktor(n_book, Croatian)',
  'language_not_found'
)

assertText(
  'string_from_table(try_until_function(' +
    'conditional_functions_sentence_from_clause, ' +
    'English, empty_context)' +
     '(try_until_function(' +
       'conditional_functions_subclassification, ' +
        'English, empty_context)' +
         '(table_by_language_from_construktor(n_encyclopedia, English), ' +
          'table_by_language_from_construktor(n_book, English))))',
  '"Encyclopedias are books."'
)
assertText(
  'string_from_table(try_until_function(' +
    'conditional_functions_sentence_from_clause, ' +
    'German, empty_context)' +
     '(try_until_function(' +
       'conditional_functions_subclassification, ' +
        'German, empty_context)' +
         '(table_by_language_from_construktor(n_encyclopedia, German), ' +
          'table_by_language_from_construktor(n_book, German))))',
  '"Enzyklopädien sind Bücher."'
)
assertText(
  'string_from_table(try_until_function(' +
    'conditional_functions_sentence_from_clause, ' +
    'English, empty_context)' +
     '(try_until_function(' +
       'conditional_functions_subclassification, ' +
        'English, empty_context)' +
         '(table_by_language_from_construktor(n_book, English), ' +
          'table_by_language_from_construktor(n_book, English))))',
  '"Books are books."'
)
assertText(
  'encyclopedias_are_books_string(English)',
  '"Encyclopedias are books."'
)
assertText(
  'encyclopedias_are_books_string(German)',
  '"Enzyklopädien sind Bücher."'
)
assertText(
  'encyclopedias_are_books_string(Croatian)',
  'table_has_no_string'
)
assertText(
  'subclassification_string_from_n_n_language(n_encyclopedia, n_book, English)',
  '"Encyclopedias are books."'
)
assertText(
  'subclassification_string_from_n_n_language(n_encyclopedia, n_book, German)',
  '"Enzyklopädien sind Bücher."'
)
assertText(
  'subclassification_string_from_n_n_language(n_encyclopedia, n_book, Croatian)',
  'table_has_no_string'
)
assertText(
  'subclassification_sentence_from_n_n_language(n_encyclopedia, n_book, English)',
  'table(English_sentence, English, "Encyclopedias are books.")'
)
assertText(
  'subclassification_sentence_from_n_n_language(n_encyclopedia, n_book, German)',
  'table(German_sentence, German, "Enzyklopädien sind Bücher.")'
)
assertText(
  'subclassification_clause_from_n_n_language(n_encyclopedia, n_book, English)',
  'table(English_clause, English, "encyclopedias are books")'
)
assertText(
  'subclassification_clause_from_n_n_language(n_encyclopedia, n_book, German)',
  'table(German_clause, German, "Enzyklopädien sind Bücher")'
)

assertText(
  'function_from_constructor(subclassification_constructor, English, empty_context)',
  'subclassification_from_n_n_en'
)
assertText(
  'function_from_constructor(subclassification_constructor, German, empty_context)',
  'subclassification_from_n_n_de'
)
assertText(
  'function_from_constructor(subclassification_constructor, Croatian, empty_context)',
  'nothing'
)

assertText(
  'instantiation_from_pn_n_en(person_en_marie_curie, noun_en_person)',
  'table(English_clause, English, "Marie Curie is a person")'
)
assertText(
  'instantiation_from_pn_n_en(' +
    'pn_from_noun_en(noun_en_wikipedia), ' +
    'noun_en_encyclopedia)',
  'table(English_clause, English, "Wikipedia is an encyclopedia")'
)
assertText(
  'instantiation_from_pn_n_en(' +
    'np_from_det_noun_en(det_en_indefinite_plural, noun_en_cat), ' +
    'noun_en_science)',
  'table(English_clause, English, "cats are a science")'
)
assertText(
  'instantiation_from_pn_n_de(person_de_marie_curie, noun_de_person)',
  'table(German_clause, German, "Marie Curie ist eine Person")'
)
assertText(
  'instantiation_from_pn_n_de(' +
    'pn_from_noun_de(noun_de_wikipedia), ' +
    'noun_de_enzyklopaedie)',
  'table(German_clause, German, "Wikipedia ist eine Enzyklopädie")'
)
assertText(
  'instantiation_from_pn_n_de(' +
    'np_from_det_noun_de(det_de_unbestimmt_mehrzahl, noun_de_katze), ' +
    'noun_de_wissenschaft)',
  'table(German_clause, German, "Katzen sind eine Wissenschaft")'
)

assertText(
  'instantiation_clause_from_person_n_language(' +
    'person_marie_curie, n_person, English)',
  'table(English_clause, English, "Marie Curie is a person")'
)
assertText(
  'instantiation_clause_from_person_n_language(' +
    'person_marie_curie, n_person, German)',
  'table(German_clause, German, "Marie Curie ist eine Person")'
)
assertText(
  'instantiation_clause_from_n_n_language(' +
    'n_wikipedia, n_encyclopedia, English)',
  'table(English_clause, English, "Wikipedia is an encyclopedia")'
)
assertText(
  'instantiation_clause_from_n_n_language(' +
    'n_wikipedia, n_encyclopedia, German)',
  'table(German_clause, German, "Wikipedia ist eine Enzyklopädie")'
)

assertText('same(English_singular, English_plural)', F)
assertText('write(five, English)', '"five"')
assertText('write(five, German)', '"fünf"')
assertText('write(five, nothing)', '"Z385"')

assertText(
  'write(evaluate(string_to_characterlist(string_abc)), English)',
  '"[character(\\"A\\"), character(\\"B\\"), character(\\"C\\")]"'
)
assertText('show(string_to_characterlist(string_abc), English)', '"[A, B, C]"')
assertText('show(string_to_characterlist(string_abc), German)', '"[A, B, C]"')
assertText('show(pair(one, two), English)', '"(one, two)"')
assertText('show(pair(one, two), German)', '"(eins, zwei)"')
assertText('show(character_a, English)', '"character_a"')
assertText('show(character_a, German)', '"zeichen_a"')
assertText('show(value(character_a), English)', '"a"')
assertText('show(value(character_a), German)', '"a"')

assertText('zid(type)', '"Z4"')
assertText('zid(id)', '"Z105"')
assertText('zid(positive_integer("0"))', 'key_not_found')
assertText('zid("id")', 'key_not_found')
assertText('type_of(zid(zid))', 'string')

assertText('show(string_abc, English)', '"string_abc"')
assertText('show(string_abc, German)', '"zeichenkette_abc"')
assertText('show(value(string_abc), English)', '"ABC"')
assertText('show(value(string_abc), German)', '"ABC"')

assertText('show(string, English)', '"string"')
assertText('show(string, German)', '"Zeichenkette"')
assertText(
  'show(value(string), English)',
  '"string(string string_value)"'
)
assertText(
  'show(value(string), German)',
  '"Zeichenkette(Zeichenkette Zeichenkettenwert)"'
)

assertText('add(division_by_zero, two)', 'division_by_zero')
assertText('add(two, division_by_zero)', 'division_by_zero')
assertText('multiply(division_by_zero, two)', 'division_by_zero')
assertText('multiply(two, division_by_zero)', 'division_by_zero')
assertText('multiply(integer_division(one, zero), zero)', 'division_by_zero')

assertText('"T\\nT"', '"T\\nT"')
assertText(
  'value(string_with_new_line)',
  '"This is a string with two lines.\\nHere we go."'
)

assertText('division_by_zero', 'division_by_zero')
assertText('value(division_by_zero)', 'division_by_zero')

assertText(
  'concatenate_with_joiner(list_string_abcdefghi, " & ")',
  '"ABC & DEF & GHI"'
)
assertText('concatenate_with_joiner(["A", "C"], "B")', '"ABC"')
assertText('concatenate_with_joiner([], "B")', '""')
assertText('concatenate_with_joiner(["A"], "B")', '"A"')

assertText('put_in_brackets("ABC")', '"[ABC]"')

assertText(
  'name(list_character_abc, English)', '"list_character_abc"')
assertText('show(list_character_abc, English)', '"list_character_abc"')
assertText('show(value(list_character_abc), English)', '"[A, B, C]"')
assertText('show(list_character_abc, German)', '"Z356"')
assertText('show(list_string_abcdefghi, English)', '"list_string_abcdefghi"')
assertText('show(value(list_string_abcdefghi), English)', '"[ABC, DEF, GHI]"')
assertText('show([one, two, three], English)', '"[one, two, three]"')
assertText('show([one, two, three], German)', '"[eins, zwei, drei]"')
assertText('show([one, two, three], Croatian)', '"[Z381, Z382, Z383]"')

assertText('name_or_zid(one, English)', '"one"')
assertText('name_or_zid(one, German)', '"eins"')
assertText('name_or_zid(one, Croatian)', '"Z381"')
assertText('name_or_zid(positive_integer("1"), English)', 'key_not_found')
assertText('name_or_zid(positive_integer("1"), German)', 'key_not_found')
assertText('name_or_zid(positive_integer("1"), Croatian)', 'key_not_found')

assertText('arguments(name)', '[zobject, language]')
assertText('arguments(value)', '[arg]')
assertText('arguments(add)', '[left, right]')
assertText('arguments(successor)', '[arg]')

assertText('argumenttype(head(arguments(name)))', 'zobject')
assertText('argumenttype(head(arguments(value)))', 'zobject')
assertText('argumenttype(head(arguments(add)))', 'positive_integer')
assertText('argumenttype(head(arguments(successor)))', 'positive_integer')

assertText(
  'argumenttype_and_name(head(arguments(name)), English)',
  '"zobject zobject"'
)
assertText(
  'argumenttype_and_name(head(arguments(value)), English)',
  '"zobject arg"'
)
assertText(
  'argumenttype_and_name(head(arguments(add)), English)',
  '"positive_integer left"'
)
assertText(
  'argumenttype_and_name(head(arguments(successor)), English)',
  '"positive_integer arg"'
)

assertText(
  'signature(add, English)',
  '"add(positive_integer left, positive_integer right) → positive_integer"'
)
assertText(
  'signature(value, English)',
  '"value(zobject arg) → zobject"'
)
assertText(
  'signature(and, English)',
  '"and(boolean left, boolean right) → boolean"'
)
assertText(
  'signature(and, German)',
  '"und(Boolescher_Wert links, Boolescher_Wert rechts) → Boolescher_Wert"'
)
assertText(
  'signature(and, Croatian)',
  '"Z57(Z50 Z57K1, Z50 Z57K2) → Z50"'
)

assertText(
  'record(pair, English)', '"pair(zobject first, zobject second)"'
)
assertText(
  'record(string, English)', '"string(string string_value)"'
)

// TODO takes too long (like, several minutes)
// TODO also, should be 3
// assertText('length(everything_by_type(kleenean))', 'positive_integer("4")')

const timeDiff = new Date() - startTime

log(
  numberOfTests + ' tests run. ' +
  numberOfErrors + ' errors encountered. ' +
  timeDiff / 1000 + ' s elapsed.'
)
if (numberOfErrors > 0) process.exit(1)
