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
const u = require('./../index.js').utils

const configpath = u.config('configpath')
const runpath = path.join(configpath, 'runs/')

let argRest = 2

let showVotes = false
let showRuns = false
let dryRun = false

while (process.argv[argRest] !== undefined) {
  let unknownArg = true
  if (process.argv[argRest] === '--chatty') {
    showVotes = true
    showRuns = true
    unknownArg = false
  }
  if (process.argv[argRest] === '--votes') {
    showVotes = true
    unknownArg = false
  }
  if (process.argv[argRest] === '--runs') {
    showRuns = true
    unknownArg = false
  }
  if (process.argv[argRest] === '--dryrun') {
    dryRun = true
    unknownArg = false
  }
  if (unknownArg) {
    console.log('ERROR - Unknown argument: ' + process.argv[argRest])
    process.exit(1)
  }
  argRest++
}

const runFiles = fs.readdirSync(runpath)

const results = {}

const log = message => {
  if (showVotes) console.log(message)
}

const fastestPerTest = (votes, runs, weight) => {
  for (let testId in runs) {
    const test = runs[testId]
    let min = Number.MAX_SAFE_INTEGER
    let winner = 'C0'
    for (let cId in test) {
      if (test[cId].average_ms < min) {
        min = test[cId].average_ms
        winner = cId
      }
    }
    if (votes[winner] === undefined) votes[winner] = 0
    votes[winner] += weight
  }
}

const fastestAverage = (votes, runs, weight) => {
  const averages = {}
  let accumulatedWeight = 0
  for (let testId in runs) {
    const test = runs[testId]
    accumulatedWeight += weight
    for (let cId in test) {
      if (averages[cId] === undefined) averages[cId] = 0
      averages[cId] += test[cId].average_ms
    }
  }
  let min = Number.MAX_SAFE_INTEGER
  let winner = 'C0'
  for (let cId in averages) {
    if (averages[cId] < min) {
      min = averages[cId]
      winner = cId
    }
  }
  if (votes[winner] === undefined) votes[winner] = 0
  votes[winner] += accumulatedWeight
}

const noErrors = (votes, runs, weight) => {
  for (let testId in runs) {
    const test = runs[testId]
    for (let cId in test) {
      if (test[cId].errors === 0) {
        if (votes[cId] === undefined) votes[cId] = 0
        votes[cId] += weight
      }
    }
  }
}

for (let runFile of runFiles) {
  const fname = runFile.slice(0, -5)
  log(fname)
  const runs = require(runpath + runFile)
  if (showRuns) console.log(runs)
  const votes = {}
  fastestPerTest(votes, runs, 3)
  log('fastest per test')
  log(votes)
  fastestAverage(votes, runs, 1)
  log('fastest average')
  log(votes)
  noErrors(votes, runs, 10)
  log('errors')
  log(votes)
  let winner = 'C0'
  let max = 0
  for (let cId in votes) {
    if (votes[cId] > max) {
      max = votes[cId]
      winner = cId
    }
  }
  if (winner === 'C0') {
    console.log('No winner could be determined for a function.')
    console.log(fname)
    console.log('This is an error. This needs to be fixed. Data not stored.')
    process.exit()
  }
  results[fname] = winner
  log('winner for ' + fname + ': ' + winner)
  log('')
}

const resultString = JSON.stringify(results, null, 2)
log('results')
log(resultString)
if (dryRun) process.exit()
fs.writeFileSync(configpath + 'calibration.json', resultString)
