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

const c = require('./utils/constants.js')
exports.constants = c.constants
exports.stableKeys = c.stableKeys

const json = require('./utils/json.js')
exports.expand = json.expand
exports.listify = json.listify
exports.delistify = json.delistify
exports.canonicalize = json.canonicalize
exports.error = json.error

const gd = require('./utils/getData.js') // json
exports.getData = gd.getData
exports.forgetAllData = gd.forgetAll
exports.setDataSourceHttp = gd.setDataSourceHttp
exports.setDataSourceFile = gd.setDataSourceFile

exports.utils = require('./utils/utils.js').utils // getData

const labelize = require('./utils/labelize.js') // u
exports.labelize = labelize.labelize
exports.delabelize = labelize.delabelize

exports.parse = require('./utils/parse.js').parse // u, labelize

const evaluate = require('./evaluate/_evaluate.js') // u
exports.alpha = evaluate.alpha
exports.beta = evaluate.beta
exports.evaluate = evaluate.evaluate
exports.forgetAllEvaluate = evaluate.forgetAll

exports.validate = require('./validate/_validate.js').validate // getData

const tz7 = require('./type/Z7.js')
exports.complete = tz7.complete
exports.pretransform = tz7.pretransform
exports.findImplementationIndex = require('./type/Z8.js').findImplementationIndex
exports.follow = require('./type/Z9.js').follow

const language = require('./language/_language.js')
exports.natify = language.natify
exports.denatify = language.denatify

exports.construct = require('./construct/_construct.js').construct
