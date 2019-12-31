const sfdcmethods = require('../sfdc-api')
const {
    Worker,
    isMainThread,
    parentPort,
    workerData
} = require('worker_threads');


const jsforce = require('jsforce')

oauth2 = new jsforce.OAuth2({
    // you can change loginUrl to connect to sandbox or prerelease env.
    // loginUrl : 'https://test.salesforce.com',
    clientId: '3MVG9i1HRpGLXp.qKwbWJHwmeMEDkgggAcpbAf1Y1O7YvezHR_7aOv00w2a_Vz3gst8vk23v4e3qfLRbkKsFi',
    clientSecret: '5675F7043344E39EC5A402927491DA9040F7C857C7A6F0B4D0AF8D3AE69BA8DF',
    redirectUri: 'https://testingauth123.herokuapp.com/auth3/login/return'
});


conn = new jsforce.Connection({
    oauth2: oauth2,
    instanceUrl: global.instanceUrl,
    accessToken: global.accesscode
})


module.exports = ({
    router
}) => {
    router
        .get('/oauth2/auth', (ctx) => {
            ctx.response.redirect(global.oauth2.getAuthorizationUrl({
                scope: 'api web'
            }))
        })
        .get('oauth', '/auth3/login/return', (ctx) => {
            var code = ctx.request.query["code"]
            console.log("**** - " + code)

            conn.authorize(code, function (err, userInfo) {
                if (err) {
                    return console.error(err)
                }
                console.log("&&& : " + conn.accessToken)
                console.log("&&& : " + conn.instanceUrl)

                global.accesscode = conn.accessToken
                global.instanceUrl = conn.instanceUrl
                global.orgId = conn.userInfo.orgId
            })
            if (!global.accesscode || !global.instanceUrl) {
                return ctx.render('welcome')
            }
        })
        .get('logout', '/logout', (ctx) => {
            conn.logout(function (err) {
                if (err) {
                    return console.error(err);
                }
                // now the session has been expired.
            });
        })

        .post('everything', '/everything', (ctx) => {
            try {
                var result = sfdcmethods.letsGetEverything()
                console.log("WHAT? : " + result)
                //ctx.body = {
                // status: 'success',
                // message: 'hello, world!'
                //};
            } catch (err) {
                console.log("Error [everything]:" + err)
            }
        })
}