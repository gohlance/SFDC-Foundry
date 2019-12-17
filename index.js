'use strict';

const Koa = require('koa')
const path = require('path')
const render = require('koa-ejs')
const koa_router = require('koa-router')

const logger = require('koa-logger')
const app = new Koa()

//*** Only for Development */
global.instanceUrl = "https://singaporeexchangelimited.my.salesforce.com"
global.accesscode = "00D46000001Uq6O!AQoAQP2ZbZFRrUuJs.iM37vtk63_5GB.8ejAR3.bTcoxErXzgKci3bgM8OJttbl3bmWXAGFAP7DdpbdtaIEbN7lEF6m5QUbb"
global.orgId = "567"

//global DB Connection
const Pool = require('pg-pool')
global.pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Beaver',
    password: 'P@ssw0rd1',
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
app.use(serve('./public'))

//log all events to the terminal
app.use(logger());

//Error Handling
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    console.log(err.status)
    ctx.status = err.status || 500;
    ctx.body = err.message;
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