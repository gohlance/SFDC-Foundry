const jsforce = require('jsforce')

var oauth2 = new jsforce.OAuth2({
    // you can change loginUrl to connect to sandbox or prerelease env.
    // loginUrl : 'https://test.salesforce.com',
    clientId: '3MVG9i1HRpGLXp.qKwbWJHwmeMEDkgggAcpbAf1Y1O7YvezHR_7aOv00w2a_Vz3gst8vk23v4e3qfLRbkKsFi',
    clientSecret: '5675F7043344E39EC5A402927491DA9040F7C857C7A6F0B4D0AF8D3AE69BA8DF',
    redirectUri: 'https://testingauth123.herokuapp.com/auth3/login/return'
});



module.exports = ({
    router
}) => {
    router
        .get('/oauth2/auth', (ctx) => {
            ctx.response.redirect(oauth2.getAuthorizationUrl({
                scope: 'api web'
            }))
        })
        //this path is set in the Connected App
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
        .get('tooling', '/tooling', (ctx) => {
            global.instanceUrl = "https://singaporeexchangelimited.my.salesforce.com"
            global.accesscode = "00D46000001Uq6O!AQoAQIBvGth39aNHu.6q5Ygh0ZaTzvruMZOEWRuBqL1IaWnmNjXzeYUWbQNLdziJ2AwTlV5m50tizWJfoIZeAeqPU3UbjFkw"
            console.log("*** Global : " + global.instanceUrl)
            console.log("*** Global : " + global.accesscode)
            if (!global.accesscode || !global.instanceUrl) {
                ctx.redirect('/oauth2/auth')
            }
            var conn = new jsforce.Connection({
                oauth2: oauth2,
                instanceUrl: global.instanceUrl,
                accessToken: global.accesscode
            })

            console.log("*** Conn : " + conn.instanceUrl)
            console.log("*** Conn : " + conn.accessToken)
            console.log("Authenticated, stating call")

            conn.sobject("Account").describe(function (err, meta) {
                if (err) {
                    return console.error(err);
                }

                console.log('meta : ' + meta)
                console.log('Label : ' + meta.label);
                console.log('Num of Fields : ' + meta.fields.length);
                // ...
            })
            conn.tooling.describeGlobal(function (err, res) {
                if (err) {
                    return console.error(err);
                }
                console.log('Num of tooling objects : ' + res.sobjects.length);
            })
        })
        .get('getApexPage', '/getApexPage', async (ctx) => {
            try {
                global.instanceUrl = "https://singaporeexchangelimited.my.salesforce.com"
                global.accesscode = "00D46000001Uq6O!AQoAQGwJVgAqPmYKj.b3Gy1K7bg6Eh6Wl8JTEiC11in3xofGyxs53aSUmOuLoWZZKiRYABZyAXNSyv.iZbF6WVdW3n_Pzkwi"
                var conn = new jsforce.Connection({
                    oauth2: oauth2,
                    instanceUrl: global.instanceUrl,
                    accessToken: global.accesscode
                })
                var something = require('../util')

                var result = await something.getAllObjects(conn)

                console.log(result.length)
                console.log(result[0].length);
                console.log(result[1].length)
                return ctx.render('objects', {
                    standardObject: result[1],
                    customObject: result[0],
                    totalObject: result[0].length + result[1].length
                })

            } catch (err) {
                console.log("Error: " + err)
            }
        })
}