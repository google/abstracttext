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

// TODO this list really should become much shorter
// ideally only Z1K1, Z1K2, and Z6K1
const stableKeys = [
  'Z1K1', 'Z1K2', 'Z6K1', 'Z11K2', 'Z16K1', 'Z16K2',
  'Z18K1', 'Z60K1', 'Z70K1', 'Z180K2'
]

const constants = {
  // Types
  ARGUMENT: 'Z18',
  ARGUMENT_DECLARATION: 'Z17',
  BOOLEAN: 'Z50',
  CHARACTER: 'Z60',
  CODE: 'Z16',
  ERROR: 'Z5',
  EXCEPTION: 'Z15',
  FUNCTION: 'Z8',
  FUNCTION_CALL: 'Z7',
  IMPLEMENTATION: 'Z14',
  BUILTIN: 'Z19',
  LIST: 'Z10',
  MONOLINGUAL_TEXT: 'Z11',
  MULTILINGUAL_TEXT: 'Z12',
  NOTHING: 'Z23',
  OBJECT: 'Z1',
  PAIR: 'Z2',
  POSITIVE_INTEGER: 'Z70',
  REFERENCE: 'Z9',
  STRING: 'Z6',
  TABLE: 'Z200',
  TYPE: 'Z4',

  language: {
    EN: 'Z251',
    DE: 'Z254',
    HR: 'Z255',
    UZ: 'Z257'
  },
  languagefallbacks: {
    Z251: [],
    Z254: ['Z251'],
    Z255: ['Z254', 'Z251'],
    Z257: ['Z251']
  },

  error: {
    ARGUMENT_NAME_MISMATCH: 'Z421',
    ARGUMENT_TYPE_MISMATCH: 'Z422',
    BUILTIN_COULD_NOT_FIND_CONTEXT_NAME: 'Z432',
    BUILTIN_TYPE_MISMATCH: 'Z431',
    ARITY_MISMATCH: 'Z425',
    CYCLIC_REFERENCE: 'Z418',
    DATA_HAS_NO_ID: 'Z402',
    DATA_ID_MISMATCH: 'Z403',
    ERROR_IN_ARGUMENT: 'Z420',
    ERROR_IN_ARGUMENT_TYPE: 'Z419',
    ERROR_IN_LANGUAGE_EXECUTION: 'Z438',
    ERROR_IN_FUNCTION: 'Z416',
    ERROR_IN_IMPLEMENTATION: 'Z436',
    ERROR_IN_REFERENCE: 'Z417',
    ERROR_IN_RETURN_TYPE: 'Z413',
    ERROR_IN_TYPE: 'Z412',
    FUNCTION_CALL_CALLS_NON_FUNCTION: 'Z429',
    IMPLEMENTATION_ID_MISSING: 'Z434',
    IMPOSSIBLE_FOR_LEGAL_REASONS: 'Z451',
    INVALID_ID: 'Z405',
    INVALID_STRING_LITERAL: 'Z455',
    JSON_SCHEMA_ERROR: 'Z410',
    KEY_VALUE_TYPE_MISMATCH: 'Z433',
    LIST_TYPE_MISMATCH: 'Z414',
    MAXIMAL_RECURSION_DEPTH_EXCEEDED: 'Z415',
    MISSING_REQUIRED_KEY: 'Z427',
    MIXING_POSITIONAL_AND_NAMED_ARGUMENTS: 'Z424',
    NAME_DOES_NOT_EXIST: 'Z404',
    NO_CONSTRUCTOR: 'Z426',
    NOT_IMPLEMENTED_YET: 'Z411',
    NOT_WELL_FORMED: 'Z401',
    PROGRAMMING_LANGUAGE_NOT_SUPPORTED: 'Z437',
    REPEATED_ARGUMENT_NAME: 'Z423',
    REPEATED_IMPLEMENTATION_ID: 'Z435',
    REPEATED_TEST_ID: 'Z440',
    RETURN_TYPE_MISMATCH: 'Z428',
    STABLE_KEY_HAS_NON_STRING_VALUE: 'Z452',
    SYNTAX_ERROR: 'Z407',
    TYPE_NOT_SUPPORTED_FOR_LANGUAGE: 'Z439',
    UNBALANCED_QUOTES: 'Z409',
    UNKNOWN_BUILTIN: 'Z430',
    UNKNOWN_KEY: 'Z454',
    UNKNOWN_TOKEN: 'Z408',
    ZOBJECT_HAS_NO_TYPE: 'Z406',
    ZOBJECTS_ONLY_ALLOW_STRINGS_AND_OBJECTS: 'Z453'
  }
}

exports.stableKeys = stableKeys
exports.constants = constants
