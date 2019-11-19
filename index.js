'use strict';

const Koa = require('koa')
const path = require('path')
const render = require('koa-ejs')
const koa_router = require('koa-router')
const passport = require('./auth')
const logger = require('koa-logger')
const app = new Koa()

global.accesscode = 'aPrxwwNuBlmuqjnefHLaFwt7x9qKnAO3G8HmHl.det4g0fz3NqxAfDtbmoQMt5IU_tQmVRlXGw=='


app.use(passport.initialize());

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    console.log(err.status)
    ctx.status = err.status || 500;
    ctx.body = err.message;
  }
})

render(app, {
  root: path.join(__dirname, 'views'),
  layout: 'layout',
  viewExt: 'html',
  cache: false,
  debug: true
})

//log all events to the terminal
app.use(logger());

//router configuration
const router = new koa_router()
require('./routes/basic')({ router })
require('./routes/sfdc')({router})
app.use(router.routes()).use(router.allowedMethods)

//port configuration
var port = process.env.PORT || 1234
app.listen(port, () => console.log("Running on port " + port))