require('dotenv/config');
const express = require('express');
const next = require('next');
const { join } = require('path');
const { parse } = require('url');
const fs = require('fs');
const browser = require('browser-detect');

const Router = require('./routes').Router;

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const rootdir = join(__dirname, '../static/rootdir');
const rootStaticFiles = fs.readdirSync(rootdir).map(f => `/${f}`);

app
  .prepare()
  .then(() => {
    const server = express();

    server.get('*', (req, res, next) => {
      const brw = browser(req.headers['user-agent']);
      let fallback = false;
      if (brw.name === 'ie') {
        switch (brw.versionNumber) {
          case 10:
            fallback = true;
            break;
          default:
            break;
        }
      }

      if (fallback) {
        res.send('Hol dir bitte einen aktuelleren Browser oder lad dir die app :)');
      } else {
        next();
      }
    });

    Router.forEachPattern((page, pattern, defaultParams) =>
      server.get(pattern, (req, res) =>
        app.render(req, res, `/${page}`, Object.assign({}, defaultParams, req.query, req.params)),
      ),
    );

    server.get('*', (req, res) => {
      const parsedUrl = parse(req.url, true);

      if (rootStaticFiles.indexOf(parsedUrl.pathname) > -1) {
        const path = join(__dirname, '../static/rootdir', parsedUrl.pathname);
        return app.serveStatic(req, res, path);
      }
      return handle(req, res);
    });
    server.listen(port);
  })
  .catch(ex => {
    // eslint-disable-next-line
    console.error(ex.stack);
    process.exit(1);
  });
