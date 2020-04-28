# eneyj

**DO NOT RUN THIS IN A PUBLIC INSTALLATION.**

**THIS MAY LEAD TO HAVING ARBITRARY
CODE RUN ON YOUR SERVER AND IN THE CLIENTS OF YOUR USERS**

eneyj is a JavaScript library that validates and evaluates functions
represented as JSON objects. It is, maybe, best described as an abstract
programming language.

eneyj has two main uses cases:

* running wikilambda.org, where everyone can add to and maintain the library
  of functions
* render content from the Abstract Wikipedia in natural language using
  a function defined in wikilambda.org

The idea is described in the following paper:
* https://arxiv.org/abs/2004.04733

Author: Denny Vrandečić <vrandecic@google.com>

Website: http://www.wikilambda.org

## Installation

If you want to run eneyj within MediaWiki, please refer to the installation
instructions for AbstractText.

**DO NOT RUN THIS IN A PUBLIC INSTALLATION.**

**THIS MAY LEAD TO HAVING ARBITRARY
CODE RUN ON YOUR SERVER AND IN THE CLIENTS OF YOUR USERS**

If you want to run eneyj stand-alone, you will need node and you might want to
use npm.

The easiest way to install eneyj is by using npm. Put the code of eneyj
somewhere, go to the eneyj directory and run the following commands:

```
npm install
mkdir config
mkdir config/runs
node src/scripts/labelMap.js
cp src/scripts/calibration-initial.json config/calibration.json
node src/scripts/measure.js --chatty
node src/scripts/calibrate.js
```

To be sure it worked, you can now run

`node src/eneyj.js --lang:en 'value(project_name)'`

The result should be

`eneyj`

## Code structure

The code consists of two main pieces:

* the kernel of Wikilambda inside of src and its subdirectories
* the function library inside of data

It is an explicit aim to keep the kernel small. Whenever we start to have a
situation where the kernel keeps growing, we probably want to abstract that
growth and lift it into the function library.
That is called internalization.

In the standard setting, the function library lives and is maintained inside
a wiki. The kernel should make only minimal assumptions about the function
library. These assumptions should written down explicitly.

