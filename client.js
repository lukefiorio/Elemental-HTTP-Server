'use strict';

const process = require('process');
const http = require('http');
const qs = require('querystring');
const fs = require('fs');

const argArray = process.argv;

let headers = {
  accept: 'application/json',
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
};

// make user & password a user argument
const encoded = new Buffer.from('brett:17').toString('base64');

if (argArray[2] === 'POST') {
  headers['Content-Type'] = 'application/x-www-form-urlencoded';
  headers['authorization'] = `Basic ${encoded}`;
}

//fyi path is of format '/helium.html'
let options = {
  host: 'localhost',
  port: 8080,
  method: argArray[2],
  path: `${argArray[3]}`,
  headers: headers,
};

// form data for POST requests
// make element attributes a user argument
if (argArray[2] === 'POST') {
  options.form = {
    elementName: 'Nitrogen',
    elementSymbol: 'N',
    elementAtomicNumber: '7',
    elementDescription: 'Explodes violently',
  };
}

// create the connection
const req = http.request(options, (resp) => {
  if (argArray[2] === 'GET') {
    let allData = '';

    resp.on('data', (data) => {
      allData += data;
    });

    resp.on('end', () => {
      console.log(allData);
    });
  }
});
if (argArray[2] === 'POST') {
  // use stringify to apply URI encoding
  req.write(qs.stringify(options.form));
}
req.end();
