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
        .get('testing', '/testing', async (ctx) => {

            const result = await global.pool.query("SELECT objectinfo FROM objects WHERE ID = 21")

            console.log("************************")

            var custom_is_false = _.filter(result.rows[0].objectinfo, function (o){
                if (o.custom == false)
                return o
            })

            console.log(custom_is_false.length)

            var layoutable_is_true = _.filter(custom_is_false, function (i){
                if (i.layoutable ==  true){
                    return i
                }
            })

            console.log(layoutable_is_true.length)

            var createable_is_true = _.filter(layoutable_is_true, function(i){
                if (i.createable == true){
                    return i
                }
            })

            console.log(createable_is_true.length)
            /**
            

            var updateable_is_false = _.map(custom_is_false, function(e){
                if (e.updateable ==  false)
                return e
            })

            var createable_is_false = _.filter(custom_is_false, function(f){
                if (f.createable ==  false)
                return f
            })

            
           
            console.log(updateable_is_false.length)
            console.log(result.rows[0].objectinfo.length)
            
            console.log(createable_is_false.length)
         */
            return ctx.render('generic', {
                object: createable_is_true
            })


        })

}