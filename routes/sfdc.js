const sfdcmethods = require('../sfdc-api')
const {
    Worker,
    isMainThread,
    parentPort,
    workerData
} = require('worker_threads');

const jsforce = require('jsforce')
const _ = require('lodash')
const chart = require('../chartGenerator')

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
        .get('showObjects', '/showObject', async (ctx) => {
            try {
                var result = await global.pool.query('SELECT objectinfo FROM objects WHERE orgid = $1', [global.orgId])

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
        .get('showRecordType', '/showRecordType', async (ctx) => {
            try {
                const result = await sfdcmethods.selectAll_RecordTypesByOrder()
                
                const range = _(result.rows).groupBy('objecttype').partition(function (item){ return item.length > 5}).value()
                
                const recordType_NotActive = _.partition(result.rows, 'active')

                return ctx.render('show_recordType', {
                    recordType: result.rows,
                    morethan: range[0].length,
                    lessthan: range[1].length,
                    totalObject: range[0].length + range[1].length,
                    notactive: recordType_NotActive[1].length
                })
            } catch (error) {
                console.error("Error [showRecordType]: " + error)
            }
        })
        .get('showProfiles', '/showProfiles', async (ctx) => {
            try {
                const result = await sfdcmethods.get_TotalUsersByProfile()

                const range = _.partition(result.undefined, function (item){
                    return item.Total >= 10;
                })

                const profileWithOnly_1User = _.partition(result.undefined, function(item){
                    return item.Total == 1;
                })

                return ctx.render('show_profiles', {
                    profiles: result.undefined,
                    morethan10: range[0].length,
                    lessthan10: range[1].length,
                    totalObject: result.undefined.length,
                    singleuser: profileWithOnly_1User[0].length
                })
            } catch (error) {
                console.error("Error [showProfiles]: " + error)
            }
        })
        .get('showApexTrigger', '/getApexTrigger', async (ctx)=>{
            try {
                const result = await global.pool.query("SELECT apextrigger FROM apextriggers WHERE orgid = $1",[global.orgId])

                const range = _(result.rows[0]["apextrigger"].records).groupBy('TableEnumOrId').value()
                const rangeCondition = _(result.rows[0]["apextrigger"].records).groupBy('TableEnumOrId').partition(function (item){
                    return item.length > 5
                }).value()

                const notActive = _.partition(result.rows[0]["apextrigger"].records, function (item){return item.Status == "Active"})
                return ctx.render('show_apexTrigger',{
                    type: "ApexTrigger",
                    apex: result.rows[0]["apextrigger"].records,
                    subheader: Object.keys(range),
                    subcontent: Object.values(range),
                    morethan:rangeCondition[0].length,
                    lessthan:rangeCondition[1].length,
                    notactive: notActive[1].length
                })
            } catch (error) {
                console.error("Error [showApexTrigger]: " + error)
            }
        })
        //***** TESTING */
        .get('getD', '/getD', async (ctx) => {
            try {
                const result = sfdcmethods.testing_getApexPageByLastModified()
            } catch (error) {

            }
        })
        .get('getUserLicense', '/getf', async (ctx) => {
            try {
                const result = sfdcmethods.get_testing()
                console.log(result)
            } catch (error) {
                console.log("A: " + error)
                return 0
            }
        })
        .get('showChart','/getChart', async (ctx)=>{
            return ctx.render('show_chart',{
                chart : chart.generate()
            })
        })
       
}