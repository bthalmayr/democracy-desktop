require('dotenv/config');
const express = require('express');
var favicon = require('serve-favicon');
const next = require('next');

const Router = require('./routes').Router;

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
var path = require('path');

app
  .prepare()
  .then(() => {
    const server = express();

    Router.forEachPattern((page, pattern, defaultParams) =>
      server.get(pattern, (req, res) =>
        app.render(req, res, `/${page}`, Object.assign({}, defaultParams, req.query, req.params)),
      ),
    );

    server.use(favicon(path.join(__dirname, '../static', 'favicon.ico')));

    server.get('*', (req, res) => handle(req, res));
    server.listen(port);
  })
  .catch(ex => {
    // eslint-disable-next-line
    console.error(ex.stack);
    process.exit(1);
  });
