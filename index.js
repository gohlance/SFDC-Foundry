'use strict';

const Koa = require('koa')
const session = require('koa-session')
const path = require('path')
const render = require('koa-ejs')
const koa_router = require('koa-router')

const logger = require('koa-logger')
const app = new Koa()

//global DB Connection
const Pool = require('pg-pool')
global.pool = new Pool({
    user: 'bxhbybpvxuyesk',
    host: 'ec2-54-174-221-35.compute-1.amazonaws.com',
    database: 'detjik593i3enh',
    password: '6ec25f57a5d561b4a6eb6e8cd93b8de3f1dbae20fed0dc55b484637bd7ef1489',
    port: 5432,
    max: 20, // set pool max size to 20
    min: 4
})

render(app, {
  root: path.join(__dirname, 'views'),
  layout: 'layout',
  viewExt: 'html',
  cache: false,
  debug: true
})
var serve = require('koa-static');

app.keys = ['82a5193f-37e4-4dba-bf9c-750389f80699']
//Session for App
app.use(session(app))
app.use(serve('./public'))

//log all events to the terminal
app.use(logger());

//Error Handling
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    console.log(error)
    ctx.status = error.status || 500;
    ctx.body = error.message;
  }
})

//router configuration
const router = new koa_router()
require('./routes/basic')({
  router
})
require('./routes/sfdc')({
  router
})

app.use(router.routes()).use(router.allowedMethods)

//port configuration
var port = process.env.PORT || 1234
app.listen(port, () => console.log("Running on port " + port))

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
})