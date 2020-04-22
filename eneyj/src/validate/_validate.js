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

const fs = require('fs')
const path = require('path')

const i = require('./../index.js')
const c = i.constants
const u = i.utils

const schemaValidator = schemaPath => {
  const Ajv = require('ajv')
  const ajv = new Ajv()
  //  ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-07.json'))
  const schema = require(schemaPath)
  const validate = ajv.compile(schema)

  return function (content) {
    const valid = validate(content)
    if (valid) return null
    return validate.errors
  }
}

const schemaValidators = {}

const schemaValidation = data => {
  if (data.Z1K1 === c.ERROR) return data
  if (schemaValidators[data.Z1K1] === undefined) {
    const filepath = path.join(
      __dirname, 'schema', data.Z1K1 + '.json'
    )
    if (!fs.existsSync(filepath)) {
      return data
    }

    schemaValidators[data.Z1K1] = schemaValidator(filepath)
  }
  const results = schemaValidators[data.Z1K1](data)

  if (results === null) {
    return data
  }
  const resultstring = JSON.stringify(results)
  return i.error(c.error.JSON_SCHEMA_ERROR, resultstring, 'val')
}

const validators = {}

const codeValidation = data => {
  if (data.Z1K1 === c.ERROR) return data
  const validator = i.utils.load(validators, __dirname, data.Z1K1)
  if (validator === null) return data
  return validator.validate(data)
}

const getKeys = typeData => {
  const result = []
  if (typeData.Z4K2 === undefined) return result
  const keys = i.delistify(typeData.Z4K2)
  for (const key of keys) {
    result.push(key.Z1K2)
  }
  return result
}

const knownKeys = data => {
  if (data.Z1K1 === c.ERROR) return data

  if (data.Z1K1 === c.FUNCTION_CALL) return data // TODO copout
  if (data.Z1K1 === 'Z21') return data // TODO copout

  const objectKeys = getKeys(i.getData(c.OBJECT))
  const typeKeys = getKeys(i.getData(data.Z1K1))

  const allowedKeys = objectKeys.concat(typeKeys)

  for (const key in data) {
    if (!allowedKeys.includes(key)) {
      return i.error(c.error.UNKNOWN_KEY, key, 'val')
    }
  }

  return data
}

const requiredKeys = data => {
  if (data.Z1K1 === c.ERROR) return data

  const typeData = i.getData(data.Z1K1)
  if (typeData.Z4K2 === undefined) return data

  for (const keyref of i.delistify(typeData.Z4K2)) {
    const key = keyref.Z1K1 === c.KEY ? keyref : i.evaluate(keyref)
    if (key.Z3K3 === undefined) continue
    const required = key.Z3K3.Z1K1 === c.BOOLEAN ? key.Z3K3 : i.evaluate(key.Z3K3)
    if (required.Z1K2 !== 'Z54') continue
    if (data[key.Z1K2] === undefined) {
      return i.error(c.error.MISSING_REQUIRED_KEY, key.Z1K2, 'val')
    }
  }

  return data
}

const declaredTypeOfKey = key => {
  const typeData = i.getData(u.zid(key))
  for (const keyData of i.delistify(typeData.Z4K2)) {
    if (keyData.Z1K2 === key) {
      if (keyData.Z3K1 === undefined) return undefined
      return i.evaluate(keyData.Z3K1).Z1K2
    }
  }
  return undefined
}

const checkTypes = data => {
  if (data.Z1K1 === c.ERROR) return data

  if (data.Z1K1 === c.FUNCTION_CALL) return data // TODO copout
  if (data.Z1K1 === 'Z21') return data // TODO copout

  for (const key in data) {
    const value = data[key]

    // TODO should this really exist?
    if (value === undefined) continue

    if (key === 'Z9K1') continue

    if (i.stableKeys.includes(key)) {
      if (typeof value !== 'string') {
        continue
        // This really should be an error message, but in order to get there
        // we need more normalization.
        /*
        return i.error(
          c.error.STABLE_KEY_HAS_NON_STRING_VALUE, [key, value], 'val')
        */
      }
      continue
    }

    if (typeof value !== 'object') {
      return i.error(
        c.error.ZOBJECTS_ONLY_ALLOW_STRINGS_AND_OBJECTS, key, 'val')
    }

    const declaredType = declaredTypeOfKey(key)
    if (declaredType === undefined) continue

    const actualType = i.evaluate(value).Z1K1

    if (actualType !== declaredType) {
      return i.error(
        c.error.KEY_VALUE_TYPE_MISMATCH,
        [key, declaredType, actualType, data.Z1K2],
        'val'
      )
    }
  }

  return data
}

const idSyntax = data => {
  if (data.Z1K1 === c.ERROR) return data

  if (['Z3', 'Z14', 'Z17', 'Z20', 'Z18', 'Z505'].includes(data.Z1K1)) return data // TODO copout

  if (data.Z1K2 === undefined) return data
  if (/^[ZB][1-9][0-9]*$/.test(data.Z1K2)) return data

  return i.error(c.error.INVALID_ID, data.Z1K2, 'val')
}

const ensureType = data => {
  if (data.Z1K1 === c.ERROR) return data
  if (data.Z1K1 !== undefined) return data

  return i.error(c.error.ZOBJECT_HAS_NO_TYPE, data, 'val')
}

const knownType = data => {
  if (data.Z1K1 === c.ERROR) return data

  const typeData = i.getData(data.Z1K1)
  if (typeData.Z1K1 !== c.TYPE) {
    return i.error(c.error.ERROR_IN_TYPE, typeData)
  }
  return data
}

const deepValidate = data => {
  if (data.Z1K1 === c.ERROR) return data

  if (data.Z1K1 === c.FUNCTION) return data // TODO copout
  if (data.Z1K1 === c.FUNCTION_CALL) return data // TODO copout

  for (const key in data) {
    if (typeof data[key] === 'object') {
      const result = validate(data[key])
      if (result.Z1K1 === c.ERROR) return result
    }
  }
  return data
}

const validate = data => {
  if (data.Z1K1 === c.ERROR) return data
  data = ensureType(data)
  data = knownType(data)
  data = idSyntax(data)
  data = schemaValidation(data)
  data = knownKeys(data)
  data = requiredKeys(data)
  data = checkTypes(data)
  data = codeValidation(data)
  data = deepValidate(data)
  return data
}

exports.validate = validate
