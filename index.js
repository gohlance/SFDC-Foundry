'use strict';

const Koa = require('koa')
const session = require('koa-session')
const render = require('koa-ejs')
const koa_router = require('koa-router')
const logger = require('koa-logger')
const serve = require('koa-static')
const passport = require('koa-passport')

const path = require('path')
const app = new Koa()

//*** Only for Development */
global.instanceUrl = "https://singaporeexchangelimited.my.salesforce.com"
global.accesscode = "00D46000001Uq6O!AQoAQIK77cN8ZIUqL7Sfrve3cvxXPLn1Ay_27.02njogezuxOAUbqAxQfWEt8DEmKUAeZoh5Ivr5HEh07KIGmMwSFmp8Uo.L"
global.orgId = "288"

//global DB Connection
const Pool = require('pg-pool')
/**
global.pool = new Pool({
    user: 'bxhbybpvxuyesk',
    host: 'ec2-54-174-221-35.compute-1.amazonaws.com',
    database: 'detjik593i3enh',
    password: '6ec25f57a5d561b4a6eb6e8cd93b8de3f1dbae20fed0dc55b484637bd7ef1489',
    port: 5432,
    max: 20, // set pool max size to 20
    min: 4
}) 
  */

//DEV
global.pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Beaver2',
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


app.keys = ['82a5193f-37e4-4dba-bf9c-750389f80699']
//Session for App
const CONFIG = {
  key: 'koa:sess', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  autoCommit: true, /** (boolean) automatically commit headers (default true) */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
};

app.use(session(CONFIG,app))

passport.serializeUser((user, done)=>{done(null, user.id)})
passport.deserializeUser((id, done)=>{
  global.pool.query("SELECT user_id, user_name, user_email FROM users WHERE user_id = $1", [id])
             .then((user)=>{
                done(null, user);  
             })
             .catch((err)=>{
               done(new Error ('User with the id ${id} does not exist'))
             })
})
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const options = {};
passport.use(new LocalStrategy(options, (username, password, done) => {
  global.pool.query("SELECT user_id, user_name, user_email FROM users WHERE user_id = $1", [id])
  .then((user) => {
    if (!user) {
      done({ type: 'email', message: 'No such user found' }, false);
      return;
    }
    if (bcrypt.compareSync(password, user.password)) {
      done(null, { id: user.id, email: user.email, userName: user.userName });
    } else {
      done({ type: 'password', message: 'Passwords did not match' }, false);
    }
  })
}))

//Serving File from public folder
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