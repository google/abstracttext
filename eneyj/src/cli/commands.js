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

const i = require('../index.js')
const u = i.utils

const commandkind = {
  ARGUMENT: 'argument',
  BOOLEAN: 'boolean',
  SIMPLE: 'simple'
}

const commands = [
  {
    replname: 'help',
    replaliases: ['man', '?'],
    kind: commandkind.ARGUMENT,
    shorthelp: 'offers help and documentation',
    longhelp: 'Type .help commands for a list of available commands.\n' +
      'With .help [command] you can get help for the given command.\n' +
      'Type a Z expression to evaluate the expression.\n' +
      'You can press tab for completion suggestions.\n' +
      'Press cursor up and down to see previously typed input.',
    command: (arg, settings, rl) => {
      if (arg === null) {
        console.log(getCommand('help').longhelp)
        return
      } else if (['commands', 'command', 'cmd', 'cmds'].includes(arg)) {
        for (let command of commands) {
          console.log('.' + command.replname + ' - ' + command.shorthelp)
        }
        return
      }
      const command = getCommand(arg)
      if (command === null) {
        console.log('Unknown argument to the .help command.')
        return
      }
      if (command.kind === commandkind.ARGUMENT) {
        console.log(command.replname + ' [argument]')
      } else if (command.kind === commandkind.BOOLEAN) {
        console.log(command.replname + ' [on|off]')
      } else if (command.kind === commandkind.SIMPLE) {
        console.log(command.replname)
      }
      console.log(command.longhelp)
      console.log('Aliases: ' + command.replaliases.join(', '))
    }
  },
  {
    replname: 'introduction',
    replaliases: ['introduce', 'intro', 'tutorial', 'start'],
    kind: commandkind.SIMPLE,
    shorthelp: 'an introduction to eneyj',
    longhelp: 'a short introduction to eneyj. No further parameters.',
    command: (settings, rl) => {
      const path = require('path')
      const filepath = path.join(__dirname, '..', '..', 'docs', 'INTRODUCTION')
      const introtext = require('fs').readFileSync(filepath, 'UTF8')
      console.log(introtext)
    }
  },
  {
    replname: 'validation',
    replaliases: ['validate', 'valid', 'val', 'v', 'check'],
    kind: commandkind.BOOLEAN,
    shorthelp: 'whether the zexpressions get validated before evaluation',
    longhelp: 'one parameter, "on" or "off", to switch validation on or off.',
    command: (bool, settings, rl) => {
      if (bool !== null) settings.doValidation = bool
      console.log('validation is', settings.doValidation ? 'on' : 'off')
    }
  },
  {
    replname: 'evaluation',
    replaliases: ['evaluate', 'eval', 'e'],
    kind: commandkind.BOOLEAN,
    shorthelp: 'whether to evaluate the zexpression or not',
    longhelp: 'one parameter, "on" or "off", to switch evaluation on or off.',
    command: (bool, settings, rl) => {
      if (bool !== null) settings.doEval = bool
      console.log('evaluation is', settings.doEval ? 'on' : 'off')
    }
  },
  {
    replname: 'linearization',
    replaliases: ['linearize'],
    kind: commandkind.BOOLEAN,
    shorthelp: 'whether to linearize the results or display the data',
    longhelp: 'one parameter, "on" or "off", to switch linearization on or off.',
    command: (bool, settings, rl) => {
      if (bool !== null) settings.doLin = bool
      console.log('linearization is', settings.doLin ? 'on' : 'off')
    }
  },
  {
    replname: 'linearizer',
    replaliases: ['lin', 'l'],
    kind: commandkind.ARGUMENT,
    shorthelp: 'set linearizer function',
    longhelp: 'set a function that takes a ZObject and returns a string',
    command: (arg, settings, rl) => {
      if (arg != null) settings.linstring = arg
      console.log('linearizer is', settings.linstring)
    }
  },
  {
    replname: 'labelization',
    replaliases: ['labelize'],
    kind: commandkind.BOOLEAN,
    shorthelp: 'whether to labelize the data',
    longhelp: 'one parameter, "on" or "off", to switch labelization on or off.',
    command: (bool, settings, rl) => {
      if (bool !== null) settings.doLabelize = bool
      console.log('labelization is', settings.doLabelize ? 'on' : 'off')
    }
  },
  {
    replname: 'canonical',
    replaliases: ['canon', 'canonicalize'],
    kind: commandkind.BOOLEAN,
    shorthelp: 'whether to canonicalize the data on display',
    longhelp: 'one parameter, "on" or "off", to switch canonicalization on or off.',
    command: (bool, settings, rl) => {
      if (bool !== null) settings.canonical = bool
      console.log('canonicalization is', settings.canonical ? 'on' : 'off')
    }
  },
  {
    replname: 'jsondir',
    replaliases: [],
    kind: commandkind.BOOLEAN,
    shorthelp: 'whether to use the more compact JSON output',
    longhelp: 'creates a more compact JSON output, that cannot be read again',
    command: (bool, settings, rl) => {
      if (bool !== null) settings.jsondir = bool
      console.log('jsondir is', settings.jsondir ? 'on' : 'off')
    }
  },
  {
    replname: 'color',
    replaliases: ['colors', 'colorization'],
    kind: commandkind.BOOLEAN,
    shorthelp: 'whether to color the JSON output',
    longhelp: 'adds color to the JSON output to increase readability',
    command: (bool, settings, rl) => {
      if (bool !== null) settings.color = bool
      console.log('color is', settings.color ? 'on' : 'off')
    }
  },
  {
    replname: 'language',
    replaliases: ['lang'],
    kind: commandkind.ARGUMENT,
    shorthelp: 'sets the language to be used for parsing and linearizing',
    longhelp: 'sets the language to be used for parsing and linearizing.\n' +
      'Use the language code or language name, i.e. "en" or "English".\n' +
      'Use "z" or "none" for explicitly setting no language.',
    command: (arg, settings, rl) => {
      if (arg !== null) {
        let lang = readLanguage(arg, settings)
        if (lang === null) {
          console.log('Unknown language')
          return
        } else {
          if (lang === 'Z23') lang = null
          settings.parselang = lang
          settings.labellang = lang
        }
      }
      if (settings.parselang === settings.labellang) {
        const text = settings.parselang === null
          ? 'nothing' : u.idlabel(settings.parselang, settings.labellang)
        console.log('language is set to ' + text)
      } else {
        let text = settings.parselang === null
          ? 'nothing' : u.idlabel(settings.parselang, settings.labellang)
        console.log('parsing language is set to ' + text)
        text = settings.labellang === null
          ? 'Z23' : u.idlabel(settings.labellang, settings.labellang)
        console.log('labeling language is set to ' + text)
      }
    }
  },
  {
    replname: 'parselang',
    replaliases: ['parsinglang', 'parselanguage', 'pl'],
    kind: commandkind.ARGUMENT,
    shorthelp: 'sets the natural language to be used for parsing',
    longhelp: 'sets the language to be used for parsing.\n' +
      'Use the language code, language name, or Z id, i.e. "en", "English" or "Z251".\n' +
      'Use "z", "Z23", "nothing" or "none" for explicitly setting no language.',
    command: (arg, settings, rl) => {
      if (arg !== null) {
        let lang = readLanguage(arg, settings)
        if (lang === null) {
          console.log('Unknown language')
          return
        } else {
          if (lang === 'Z23') lang = null
          settings.parselang = lang
        }
      }
      const text = settings.parselang === null
        ? 'nothing' : u.idlabel(settings.parselang, settings.labellang)
      console.log('parsing language is set to ' + text)
    }
  },
  {
    replname: 'labellang',
    replaliases: ['labelinglang', 'labellanguage', 'lablang', 'll'],
    kind: commandkind.ARGUMENT,
    shorthelp: 'sets the labeling language to be used for output',
    longhelp: 'sets the language to be used for labeling the output.\n' +
      'Use the language code, language name, or Z id, i.e. "en", "English" or "Z251".\n' +
      'Use "z", "Z23", "nothing" or "none" for explicitly setting no language.',
    command: (arg, settings, rl) => {
      if (arg !== null) {
        let lang = readLanguage(arg, settings)
        if (lang === null) {
          console.log('Unknown language')
          return
        } else {
          if (lang === 'Z23') lang = null
          settings.labellang = lang
        }
      }
      const text = settings.labellang === null
        ? 'nothing' : u.idlabel(settings.labellang, settings.labellang)
      console.log('labeling language is set to ' + text)
    }
  },
  {
    replname: 'timer',
    replaliases: ['time'],
    kind: commandkind.BOOLEAN,
    shorthelp: 'whether to display timing data',
    longhelp: 'one parameter, "on" or "off", to switch the timer on or off.',
    command: (bool, settings, rl) => {
      if (bool !== null) settings.timer = bool
      console.log('timer is', settings.timer ? 'on' : 'off')
    }
  },
  {
    replname: 'clearcache',
    replaliases: ['clear_caches', 'clear_cache', 'reset', 'forget', 'forget_all'],
    kind: commandkind.SIMPLE,
    shorthelp: 'clears all caches',
    longhelp: 'clears all caches of Z Objects and evaluation caches.',
    command: (settings, rl) => {
      i.forgetAllData()
      i.forgetAllEvaluate()
    }
  },
  {
    replname: 'log',
    replaliases: ['showlog', 'logs', 'debug'],
    kind: commandkind.ARGUMENT,
    shorthelp: 'to switch on and off specific logs.',
    longhelp: 'to switch on and off specific logs. Logs are specified in the ' +
      'format\n  "log:eval:*,debug", as a comma-separated list of ' +
      'hierarchical markers separated by colons\n(see debug npm package). ' +
      'Use "all" for all logs (the same as "eneyj:log:*,eneyj:debug"), or\n' +
      '"none" to switch all off.',
    command: (arg, settings, rl) => {
      const debug = require('debug')
      const util = require('util')
      util.inspect.defaultOptions.depth = 9
      if (arg !== null) {
        if (['all', 'on', 'start'].includes(arg)) {
          debug.enable('eneyj:debug,eneyj:log:*')
        } else if (['none', 'off', 'over', 'end'].includes(arg)) {
          debug.disable()
        } else {
          debug.enable(arg)
        }
      }
      let namespaces = debug.disable()
      console.log('current logs: ' + namespaces)
      debug.enable(namespaces)
    }
  },
  {
    replname: 'label',
    replaliases: ['id', 'name'],
    kind: commandkind.ARGUMENT,
    shorthelp: 'maps an ID to a label and the other way around',
    longhelp: 'takes one parameter, either an id or a label, and returns the other.\n' +
      'If no ID or label are found, the input is being returned.',
    command: (arg, settings, rl) => {
      if (u.iszid(arg) || u.iszkid(arg)) {
        console.log(u.idlabel(arg, settings.labellang))
      } else {
        console.log(u.delabel(arg, settings.parselang))
      }
    }
  },
  {
    replname: 'exit',
    replaliases: ['quit', 'end', 'close', 'x', 'q'],
    kind: commandkind.SIMPLE,
    shorthelp: 'end eneyj',
    longhelp: 'closes the command line interface for eneyj and returns to the shell.',
    command: (settings, rl) => {
      rl.close()
    }
  }
]

const readLanguage = (arg, settings) => {
  if (['z', 'Z23', 'nothing', 'none'].includes(arg)) { return 'Z23' }
  let result = i.evaluate(i.parse(arg, settings.parselang))
  if (result.Z1K1 === 'Z180') { return result.Z1K2 }
  result = i.evaluate(i.parse('Z189("' + arg + '")'))
  if (result.Z1K1 === 'Z180') { return result.Z1K2 }
  return null
}

const getCommand = cmd => {
  if (cmd[0] === '.') { cmd = cmd.slice(1) }
  for (const command of commands) {
    if (command.replname === undefined) continue
    const names = (command.replaliases === undefined ? [] : command.replaliases).concat([command.replname])
    if (names.includes(cmd)) { return command }
  }
  return null
}

const processCommand = (line, settings, rl) => {
  const pieces = line.trim().split(/\s+/)
  if (pieces.length > 2) {
    console.log('Too many arguments.')
    return
  }
  let cmd = pieces[0]
  let arg = pieces.length === 1 ? null : pieces[1]
  if (cmd === '.') {
    cmd = 'help'
    if (arg === null) { arg = 'commands' }
  }
  const command = getCommand(cmd)

  if (command === null) {
    console.log('Unknown command.')
    return
  }

  if (command.kind === commandkind.ARGUMENT) {
    command.command(arg, settings, rl)
    return
  } else if (command.kind === commandkind.SIMPLE) {
    if (arg !== null) {
      console.log('Too many arguments.')
      return
    }
    command.command(settings, rl)
    return
  } else if (command.kind === commandkind.BOOLEAN) {
    let bool
    if (['on', 'true', 'active', '+', 'yes', 'T'].includes(arg)) {
      bool = true
    }
    if (['off', 'false', 'inactive', '-', 'no', 'F'].includes(arg)) {
      bool = false
    }
    if (arg === null) { bool = null }
    if (bool === undefined) {
      console.log('Argument not understood.')
    }
    command.command(bool, settings, rl)
    return
  }
  console.log('Unknown command type.')
}

exports.commands = commands
exports.command = processCommand
