const passport = require('../auth')
const jsforce = require('jsforce')

var oauth2 = new jsforce.OAuth2({
  // you can change loginUrl to connect to sandbox or prerelease env.
  // loginUrl : 'https://test.salesforce.com',
  clientId : '3MVG9i1HRpGLXp.qKwbWJHwmeMEDkgggAcpbAf1Y1O7YvezHR_7aOv00w2a_Vz3gst8vk23v4e3qfLRbkKsFi',
  clientSecret : '5675F7043344E39EC5A402927491DA9040F7C857C7A6F0B4D0AF8D3AE69BA8DF',
  redirectUri : 'https://testingauth123.herokuapp.com/auth3/login/return'
});

module.exports = ({
    router
  }) => {
    router
      .get('koala', '/', (ctx) => {
        ctx.body = "Welcome!"
      })
      .get('hello', '/hello', (ctx) => {
        ctx.body = "Hello"
      })
      .get('/oauth2/auth', function(req, res) {
        res.redirect(oauth2.getAuthorizationUrl({ scope : 'api id web' }))
      })
      .get('oauth', '/auth3/login/return', function(req, res){
          var conn = new jsforce.Connection({
            oauth2: oauth2
          })
          var code = req.param('code')
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

              res.send('success')
            })
        })

        //this is old section
        .get('auth3', '/auth3', (ctx) => {
          return ctx.render('index2')
        })
        .get('auth3', '/auth3/login', passport.authenticate('salesforce', {
            failureRedirect: '/auth/salesforce/callback'
          }),
          function (request, response) {
            console.log("******R : " + request + " Res : " + response)
          })
        .get('auth3', '/auth3/login/return1', (ctx) => {
          console.log(" **** I am here **** : " + ctx.request)
          console.log(" **** I am here **** : " + ctx.response)

          accesscode = ctx.request.query["code"]
          return ctx.render('success', {
            code: accesscode
          })
        })
      }