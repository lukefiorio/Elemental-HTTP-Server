const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const userPasswords = require('./userPasswords.js');

const server = http.createServer((req, resp) => {
  if (req.method === 'PUT') {
    const headerObj = req.headers;
    const hasAuthHeader = headerObj.hasOwnProperty('authorization');
    if (!hasAuthHeader) {
      resp.writeHead(401, {
        'Content-Type': 'application/json',
        'WWW-Authenticate': `Basic realm="Secure Area"`,
      });
      resp.end(`<html><body>Not Authorized</body></html>`);
    } else if (hasAuthHeader) {
      const base64auth = headerObj.authorization.substring(6, headerObj.authorization.length);
      const decodedAuth = new Buffer.from(base64auth, 'base64').toString();
      const user = decodedAuth.substring(0, decodedAuth.indexOf(':'));
      const password = decodedAuth.substring(decodedAuth.indexOf(':') + 1, decodedAuth.length);
      if (userPasswords.hasOwnProperty(user) && userPasswords[user] === password) {
        fs.access(`public${req.url}`, function(err) {
          // file exists
          if (!err) {
            req.setEncoding('utf8');
            let allData = '';
            req.on('data', (data) => {
              allData += data;
            });
            req.on('end', function() {
              const postData = qs.parse(allData);
              const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>The Elements - ${postData.elementName}</title>
    <link rel="stylesheet" href="/css/styles.css" />
  </head>
  <body>
    <h1>${postData.elementName}</h1>
    <h2>${postData.elementSymbol}</h2>
    <h3>Atomic number ${postData.elementAtomicNumber}</h3>
    <p>
      ${postData.elementDescription}
    </p>
    <p><a href="/">back</a></p>
  </body>
</html>`;
              fs.writeFile(`public/${postData.elementName.toLowerCase()}.html`, htmlTemplate, 'utf8', function(err) {
                if (err) {
                  return console.log(err);
                }
              });
            });
            resp.writeHead(200, {
              'Content-Type': 'application/json',
            });
            resp.end(`{ "sucess" : true }`);
            // file doesn't exist
          } else {
            resp.writeHead(500, {
              'Content-Type': 'application/json',
            });
            resp.end(`{ "error" : resource public${req.url} does not exist" }`);
          }
        });
      } else {
        resp.writeHead(401, {
          'Content-Type': 'application/json',
          'WWW-Authenticate': `Basic realm="Secure Area"`,
        });
        resp.end(`<html><body>Not Authorized</body></html>`);
      }
    }
  }

  if (req.method === 'DELETE') {
    const headerObj = req.headers;
    const hasAuthHeader = headerObj.hasOwnProperty('authorization');
    if (!hasAuthHeader) {
      resp.writeHead(401, {
        'Content-Type': 'application/json',
        'WWW-Authenticate': `Basic realm="Secure Area"`,
      });
      resp.end(`<html><body>Not Authorized</body></html>`);
    } else if (hasAuthHeader) {
      const base64auth = headerObj.authorization.substring(6, headerObj.authorization.length);
      const decodedAuth = new Buffer.from(base64auth, 'base64').toString();
      const user = decodedAuth.substring(0, decodedAuth.indexOf(':'));
      const password = decodedAuth.substring(decodedAuth.indexOf(':') + 1, decodedAuth.length);
      if (userPasswords.hasOwnProperty(user) && userPasswords[user] === password) {
        fs.access(`public${req.url}`, function(err) {
          // file exists
          if (!err) {
            // delete file
            fs.unlink(`public${req.url}`, (err) => {
              if (err) {
                throw err;
              }
              console.log(`public${req.url} was deleted`);
            });
            // remake index.html
            //req.on('end', function() {
            fs.readdir('./public', (err, files) => {
              const elemFiles = files.filter(
                (file) => file !== '.keep' && file !== '404.html' && file !== 'css' && file !== 'index.html',
              );
              // generate li tags for each element file
              let elemTags = '';
              let elemLowerCase = '';
              let elemProperCase = '';
              let elemSubStr = 0;
              for (let element = 0; element < elemFiles.length; element++) {
                elemLowerCase = elemFiles[element].toLowerCase();
                elemProperCase = elemFiles[element].charAt(0).toUpperCase() + elemFiles[element].slice(1);
                elemSubStr = elemFiles[element].indexOf('.');
                elemTags += `      <li>
        <a href="/${elemLowerCase}">${elemProperCase.substring(0, elemSubStr)}</a>
      </li>
`;
              }
              const indexTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>The Elements</title>
    <link rel="stylesheet" href="/css/styles.css" />
  </head>
  <body>
    <h1>The Elements</h1>
    <h2>These are all the known elements.</h2>
    <h3>These are ${elemFiles.length}</h3>
    <ol>
${elemTags}    </ol>
  </body>
</html>`;
              fs.writeFile(`public/index.html`, indexTemplate, 'utf8', function(err) {
                if (err) {
                  return console.log(err);
                }
              });
            });
            resp.writeHead(200, {
              'Content-Type': 'application/json',
            });
            resp.end(`{ "sucess" : true }`);
            // file doesn't exist
          } else {
            resp.writeHead(500, {
              'Content-Type': 'application/json',
            });
            resp.end(`{ "error" : resource public${req.url} does not exist" }`);
          }
        });
      } else {
        resp.writeHead(401, {
          'Content-Type': 'application/json',
          'WWW-Authenticate': `Basic realm="Secure Area"`,
        });
        resp.end(`<html><body>Not Authorized</body></html>`);
      }
    }
  }

  if (req.method === 'POST' && req.url !== '/elements') {
    resp.writeHead(500, {
      'Content-Type': 'application/json',
    });
    resp.end(`{ "error" : may only post to /elements" }`);
  }

  if (req.method === 'POST' && req.url === '/elements') {
    const headerObj = req.headers;
    const hasAuthHeader = headerObj.hasOwnProperty('authorization');
    if (!hasAuthHeader) {
      resp.writeHead(401, {
        'Content-Type': 'application/json',
        'WWW-Authenticate': `Basic realm="Secure Area"`,
      });
      resp.end(`<html><body>Not Authorized</body></html>`);
    } else if (hasAuthHeader) {
      const base64auth = headerObj.authorization.substring(6, headerObj.authorization.length);
      const decodedAuth = new Buffer.from(base64auth, 'base64').toString();
      const user = decodedAuth.substring(0, decodedAuth.indexOf(':'));
      const password = decodedAuth.substring(decodedAuth.indexOf(':') + 1, decodedAuth.length);
      if (userPasswords.hasOwnProperty(user) && userPasswords[user] === password) {
        req.setEncoding('utf8');
        let allData = '';
        req.on('data', (data) => {
          allData += data;
        });
        req.on('end', function() {
          const postData = qs.parse(allData);

          const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>The Elements - ${postData.elementName}</title>
    <link rel="stylesheet" href="/css/styles.css" />
  </head>
  <body>
    <h1>${postData.elementName}</h1>
    <h2>${postData.elementSymbol}</h2>
    <h3>Atomic number ${postData.elementAtomicNumber}</h3>
    <p>
      ${postData.elementDescription}
    </p>
    <p><a href="/">back</a></p>
  </body>
</html>`;
          fs.writeFile(`public/${postData.elementName.toLowerCase()}.html`, htmlTemplate, 'utf8', function(err) {
            if (err) {
              return console.log(err);
            }
          });
          fs.readdir('./public', (err, files) => {
            const elemFiles = files.filter(
              (file) => file !== '.keep' && file !== '404.html' && file !== 'css' && file !== 'index.html',
            );
            // generate li tags for each element file
            let elemTags = '';
            let elemLowerCase = '';
            let elemProperCase = '';
            let elemSubStr = 0;
            for (let element = 0; element < elemFiles.length; element++) {
              elemLowerCase = elemFiles[element].toLowerCase();
              elemProperCase = elemFiles[element].charAt(0).toUpperCase() + elemFiles[element].slice(1);
              elemSubStr = elemFiles[element].indexOf('.');
              elemTags += `      <li>
        <a href="/${elemLowerCase}">${elemProperCase.substring(0, elemSubStr)}</a>
      </li>
`;
            }
            const indexTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>The Elements</title>
    <link rel="stylesheet" href="/css/styles.css" />
  </head>
  <body>
    <h1>The Elements</h1>
    <h2>These are all the known elements.</h2>
    <h3>These are ${elemFiles.length}</h3>
    <ol>
${elemTags}    </ol>
  </body>
</html>`;
            fs.writeFile(`public/index.html`, indexTemplate, 'utf8', function(err) {
              if (err) {
                return console.log(err);
              }
            });
          });
        });
        resp.writeHead(200, {
          'Content-Type': 'application/json',
        });
        resp.end(`{ "sucess" : true }`);
      } else {
        resp.writeHead(401, {
          'Content-Type': 'application/json',
          'WWW-Authenticate': `Basic realm="Secure Area"`,
        });
        resp.end(`<html><body>Not Authorized</body></html>`);
      }
    }
  }

  if (req.method === 'GET') {
    fs.readFile(`public${req.url}`, 'utf8', (err, data) => {
      if (err) {
        fs.readFile(`public/404.html`, 'utf8', (failErr, failData) => {
          console.log(failData);
          resp.writeHead(404, {
            'Content-Type': 'application/json',
          });
          resp.end(failData);
        });
      } else {
        resp.writeHead(200, {
          'Content-Type': 'application/json',
        });
        resp.end(data);
      }
    });
  }
});

server.listen(8080);
