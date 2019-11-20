'use strict';

const Koa = require('koa')
const path = require('path')
const render = require('koa-ejs')
const koa_router = require('koa-router')
const passport = require('./auth')
const logger = require('koa-logger')
const app = new Koa()

global.accesscode = 'aPrxwwNuBlmuqjnefHLaFwt7x4QToW.8EBoiZC5us_rn3f1VKuLazY3VXHDSojvniM.hLYrw7w=='

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

const jsforce = require('jsforce')

var oauth2 = new jsforce.OAuth2({
  // you can change loginUrl to connect to sandbox or prerelease env.
  // loginUrl : 'https://test.salesforce.com',
  clientId : '3MVG9i1HRpGLXp.qKwbWJHwmeMEDkgggAcpbAf1Y1O7YvezHR_7aOv00w2a_Vz3gst8vk23v4e3qfLRbkKsFi',
  clientSecret : '5675F7043344E39EC5A402927491DA9040F7C857C7A6F0B4D0AF8D3AE69BA8DF',
  redirectUri : 'https://testingauth123.herokuapp.com/auth3/login/return'
});


router
.get('/oauth2/auth', (ctx) => {
  ctx.response.redirect(oauth2.getAuthorizationUrl({ scope : 'api web' }))
})
.get('oauth', '/auth3/login/return', function (req, res){ 
    var conn = new jsforce.Connection({
      oauth2: oauth2
    })
    var code = req.param('code')
    console.log("**** - " + code);
    conn.authorize(code, function (err, userInfo) {
        if (err) {
          return console.error(err)
        }
        console.log("&&& : " + conn.accessToken)
        console.log("&&& : " + conn.refreshToken)
        console.log("&&& : " + conn.instanceUrl)
        console.log("&&& : " + conn.userInfo.orgId)

        global.accesscode = conn.accessToken
        global.refreshToken = conn.refreshToken
        global.profile = conn.instanceUrl
        global.orgId = conn.userInfo.orgId
        global.userinfo = conn.userInfo

        //ctx.response.send('success')
      })
  })

app.use(router.routes()).use(router.allowedMethods)

//port configuration
var port = process.env.PORT || 1234
app.listen(port, () => console.log("Running on port " + port))