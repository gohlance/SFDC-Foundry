
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
        .get('getAllObjects', '/getAllObjects', async (ctx) => {
            try {
                global.instanceUrl = "https://singaporeexchangelimited.my.salesforce.com"
                global.accesscode = "00D46000001Uq6O!AQoAQJs918ATMWvMEx.YQ_vkzvCKedeDjcCFvFFQHxH8FjyQgUrxVWHHv2vE2kt8F_eV2lutz1nz68Mt_h2V4ITYMF_lvkSG"
                var conn = new jsforce.Connection({
                    oauth2: oauth2,
                    instanceUrl: global.instanceUrl,
                    accessToken: global.accesscode
                })
                var something = require('../util')
                var result = await something.getAllObjects(conn)
                
                //console.log("%%% : " + result)
                return ctx.render('objects', {
                    allObject: result.allObject,
                    totalObject: result.allObject,
                    morethan100: result.morethan100,
                    lessthan100: result.lessthan100
                })

            } catch (err) {
                console.log("Error: getAllObjects " + err)
            }
        })
        .get('getAllApexTrigger','/getAllApexTrigger', async (ctx)=>{
            try{
                global.instanceUrl = "https://singaporeexchangelimited.my.salesforce.com"
                global.accesscode = "00D46000001Uq6O!AQoAQJs918ATMWvMEx.YQ_vkzvCKedeDjcCFvFFQHxH8FjyQgUrxVWHHv2vE2kt8F_eV2lutz1nz68Mt_h2V4ITYMF_lvkSG"
                var conn = new jsforce.Connection({
                    oauth2: oauth2,
                    instanceUrl: global.instanceUrl,
                    accessToken: global.accesscode
                })
                
                var something = require('../util')
                var result = await something.getAllApexTrigger(conn)

                return ctx.render('trigger',{
                    trigger: result
                })
            }catch (err){
                console.log("Error : " + err)
            }
        })
}