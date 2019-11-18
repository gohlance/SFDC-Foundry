'use strict';
const Koa = require('koa')
const path = require('path')
const render = require('koa-ejs')
const koa_router = require('koa-router')

const passport = require('./auth')

const app = new Koa()
const router = new koa_router()

app.use(passport.initialize());

app.use( async (ctx, next) => {
    try {
      await next()
    } catch(err) {
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

router
.get('koala', '/', (ctx)=>{
    ctx.body = "Welcome!"
})
.get('hello','/hello', (ctx) =>{
    ctx.body = "Hello"
})
.get('auth','/auth',passport.authenticate('salesforce',{ failureRedirect: '/auth/salesforce/callback' }),
  function(request, response){
    console.log("R : " + request + " Res : " + response)
  } //http://localhost:1234/auth/salesforce/callback

)

app.use(router.routes()).use(router.allowedMethods)

app.listen(1234, ()=> console.log("Running on port 1234"))