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
        .get('showObjects','/showObject', async (ctx)=>{
            try {
                var result =  await  global.pool.query('SELECT objectinfo FROM objects WHERE orgid = $1',[global.orgId])
               
                return ctx.render('objects', {
                    allObject: result.rows[0]["objectinfo"]["allObject"],
                    totalObject: result.rows[0]["objectinfo"]["allObject"].length,
                    moreObject: result.rows[0]["objectinfo"].morethan100,
                    lessObject: result.rows[0]["objectinfo"].lessthan100
                })
            } catch (err) {
                console.error("Error [getAllObjects] " + err)
            }
        })
        .post('everything', '/everything', async (ctx) => {
            try {
                var result = await sfdcmethods.letsGetEverything()
                //ctx.body = {
                // status: 'success',
                // message: 'hello, world!'
                //};
            } catch (err) {
                console.error("Error [everything]:" + err)
            }
        })
        .get('showRecordType','/showRecordType', async (ctx) => {
            try {
                const result = await sfdcmethods.selectAll_RecordTypesByOrder()
                return ctx.render('show_recordType',{
                    recordType: result.rows
                })
            } catch (error) {
                console.error("Error [showRecordType]: " + error)
            }
        })
        .get('showProfiles','/showProfiles', async (ctx) => {
            try {
                const result =  await sfdcmethods.selectAll_ProfilesByOrder()
                return ctx.render('show_profiles',{
                    profiles: result.rows
                })
            } catch (error) {
                console.error("Error [showProfiles]: " + error)
            }
        })
        //***** TESTING */
        .get('getA', '/getA', async (ctx) => {
            try {
                const result = await global.pool.query("SELECT objectinfo FROM objects WHERE orgid = '8888'")
        
                return ctx.render('generic', {
                    object: result
                })
            }catch (error){
                console.error(error)
            }
        })
        //This section show the totalfields
        .get('getB', '/getB', async (ctx) => {
            try {
                const result = await global.pool.query("SELECT objectinfo FROM objects WHERE orgid = '999'")
        
                return ctx.render('generic', {
                    object: result
                })
            }catch (error){console.error(error)}
        })
        .get('getC', '/getC', async (ctx) => {
            try {
                const result = await global.pool.query("SELECT recordtype FROM recordtypes WHERE orgid=$1",[global.orgId])
        
                return ctx.render('generic', {
                    object: result
                })
            }catch (error){console.error(error)}
        })
        .get('getD','/getD', async (ctx) => {
            try {
                const result = sfdcmethods.testing_getApexPageByLastModified()
            } catch (error) {
                
            }
        })
}