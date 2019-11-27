'use strict';

const Koa = require('koa')
const path = require('path')
const render = require('koa-ejs')
const koa_router = require('koa-router')

const logger = require('koa-logger')
const app = new Koa()

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