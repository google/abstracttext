const http = require('http');
const url = require('url');

const hostname = '127.0.0.1';
const port = 3000;

const i = require('../index.js')
const c = i.constants
const evaluate = i.evaluate
const expand = i.expand
const validate = i.validate
const parse = i.parse
const delabelize = i.delabelize

// Pulled from cli/settings.js - should be in utils maybe?

const readLanguage = input => {
  const result = evaluate(parse('Z189("' + input + '")'))
  if (result.Z1K1 === 'Z180') { return result.Z1K2 }
  console.log('ERROR - Unknown language: ' + input)
  process.exit(1)
}

const showWithLabels = lang => {
  expr = 'Z79(Z63,'.concat(lang).concat(')');
  return expr;
};

const run = settings => {
  const server = http.createServer((req, res) => {
    const queryObject = url.parse(req.url,true).query;
    let call = queryObject.call;

    let parselang = 'Z251';
    let labellang = parselang;

    if ("lang" in queryObject) {
      parselang = readLanguage(queryObject.lang);
      labellang = parselang;
    }
    if ("parselang" in queryObject) {
      parselang = readLanguage(queryObject.parselang);
    }
    if ("labellang" in queryObject) {
      labellang = readLanguage(queryObject.labellang);
    }

    // mostly copied from cli/answer.js - should be extracted somewhere?
    if (call[0] === '{') {
      var data = expand(delabelize(JSON.parse(call), parselang));
    } else {
      data = parse(call, parselang);
    }
    data = validate(data);
    data = evaluate(data);
    const lincall = {
      Z1K1: c.FUNCTION_CALL,
      Z7K1: parse(showWithLabels(labellang)),
      K1: data
    }
    data = evaluate(lincall)
    if (data.Z1K1 === c.STRING) data = data.Z6K1
  
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.write(data);
    res.end();
  });

  server.listen(port);
}

exports.run = run
