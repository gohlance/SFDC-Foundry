'use strict';

const Koa = require('koa')
const path = require('path')
const render = require('koa-ejs')
const koa_router = require('koa-router')
const passport = require('./auth')
const logger = require('koa-logger')
const app = new Koa()

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
.get('oauth', '/auth3/login/return', (ctx) => { 
    var conn = new jsforce.Connection({
      oauth2: oauth2
    })
    var code = ctx.request.query["code"]
    console.log("**** - " + code);
    conn.authorize(code, function (err, userInfo) {
        if (err) {
          return console.error(err)
        }
        console.log("&&& : " + conn.accessToken)
        //console.log("&&& : " + conn.refreshToken)
        console.log("&&& : " + conn.instanceUrl)
        //console.log("&&& : " + conn.userInfo.orgId)

        global.accesscode = conn.accessToken
        //global.refreshToken = conn.refreshToken
        global.instanceUrl = conn.instanceUrl
        global.orgId = conn.userInfo.orgId
        //global.userinfo = conn.userInfo

        ctx.response.send('success')
      })
  })
.get('tooling', '/tooling', (ctx) => {
  if (global.accesscode || global.instanceUrl){
    ctx.redirect('/oauth2/auth')
  }

  var conn = new jsforce.Connection({
    oauth2: oauth2,
    instanceUrl: global.instanceUrl ,
		accessToken: global.accesscode
  })
  console.log("*** Conn : " + conn.instanceUrl)
  console.log("*** Conn : " + conn.accessToken)
  console.log("Authenticated, stating call")
  conn.sobject("Account").describe(function(err, meta) {
    if (err) { return console.error(err); }
    console.log('Label : ' + meta.label);
    console.log('Num of Fields : ' + meta.fields.length);
    // ...
  })
  conn.tooling.describeGlobal(function(err, res) {
    if (err) { return console.error(err); }
    console.log('Num of tooling objects : ' + res.sobjects.length);
  })
})

app.use(router.routes()).use(router.allowedMethods)

//port configuration
var port = process.env.PORT || 1234
app.listen(port, () => console.log("Running on port " + port))