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
const globalAlpha = i.alpha
const globalBeta = i.beta

const alphaConversion = (v, guid) => (data) => globalAlpha(data, v, guid)

const alpha = (data, variableName, guid) => {
  if (data.Z1K1 !== c.FUNCTION) return data

  const argumentList = []
  const n = i.findImplementationIndex(data)
  let implementation = i.delistify(data.Z8K4)[n]

  // first alpha convert the own args, to catch all bound variables
  for (let argument of i.delistify(data.Z8K1)) {
    if (argument.guid !== undefined) {
      argumentList.push(argument)
      continue
    }

    const guidInternal = u.guid()
    const conversion = alphaConversion(argument.Z1K2, guidInternal)
    const envelopeConversion = (envelope) => {
      return {
        Z1K1: c.IMPLEMENTATION,
        Z1K2: envelope.Z1K2,
        Z14K1: conversion(envelope.Z14K1)
      }
    }
    argumentList.push({
      Z1K2: argument.Z1K2,
      Z17K1: argument.Z17K1,
      guid: guidInternal
    })
    implementation = envelopeConversion(implementation)
  }

  // now alpha convert the implementation
  const envelopeConversion = (envelope) => {
    return {
      Z1K1: c.IMPLEMENTATION,
      Z1K2: envelope.Z1K2,
      Z14K1: alphaConversion(variableName, guid)(envelope.Z14K1)
    }
  }
  implementation = envelopeConversion(implementation)

  return {
    Z1K1: c.FUNCTION,
    Z1K2: data.Z1K2,
    Z1K3: data.Z1K3,
    Z8K1: i.listify(argumentList),
    Z8K2: data.Z8K2,
    Z8K4: i.listify([implementation])
  }
}

const beta = (data, variableName, guid, value) => {
  if (data.Z1K1 !== c.FUNCTION) return data
  const argumentList = []
  for (let argument of i.delistify(data.Z8K1)) {
    if (argument.guid === guid) continue
    argumentList.push(argument)
  }
  const n = i.findImplementationIndex(data)
  const implementation = i.delistify(data.Z8K4)[n].Z14K1
  let imp = implementation
  if (implementation.Z1K1 === c.CODE) {
    imp = {
      Z1K1: c.CODE,
      Z16K1: implementation.Z16K1,
      Z16K2: implementation.Z16K2,
      context: implementation.context,
      argument_types: data.Z8K1,
      return_type: data.Z8K2
    }
  }
  const result = globalBeta(imp, variableName, guid, value)
  if (argumentList.length === 0) return result
  return {
    Z1K1: c.FUNCTION,
    Z1K2: data.Z1K2,
    Z1K3: data.Z1K3,
    Z8K1: i.listify(argumentList),
    Z8K2: data.Z8K2,
    Z8K4: i.listify([{
      Z1K1: c.IMPLEMENTATION, // TODO what about Z1K2?
      Z14K1: result
    }])
  }
}

exports.alpha = alpha
exports.beta = beta
