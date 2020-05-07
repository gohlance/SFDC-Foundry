const sfdcmethods = require('../sfdc-api')
const sfdcbackground_methods = require('../svc_background/sfdc-api_background')
const {
    Worker,
    isMainThread,
    parentPort,
    workerData
} = require('worker_threads');

const jsforce = require('jsforce')
const _ = require('lodash')

oauth2 = new jsforce.OAuth2({
    // you can change loginUrl to connect to sandbox or prerelease env.
    // loginUrl : 'https://test.salesforce.com',
    clientId: '3MVG9i1HRpGLXp.qKwbWJHwmeMEDkgggAcpbAf1Y1O7YvezHR_7aOv00w2a_Vz3gst8vk23v4e3qfLRbkKsFi',
    clientSecret: '5675F7043344E39EC5A402927491DA9040F7C857C7A6F0B4D0AF8D3AE69BA8DF',
    redirectUri: 'https://warm-garden-23298.herokuapp.com/auth3/login/return'
});

conn = new jsforce.Connection({
    //oauth2: oauth2
    oauth2: oauth2,
    instanceUrl: global.instanceUrl,
    accessToken: global.accesscode,
    version: '48.0'
})

async function private_gettoken(code) {
    return new Promise((resolve, reject) => {
        conn.authorize(code, function (err, userInfo) {

            if (err) {
                console.error(err)
            }
            console.log("AccessToken : " + conn.accessToken + " InstanceURL : " + conn.instanceUrl)
            //console.log("Id : " + userInfo.organizationId)
            let status = true
            resolve([status, conn.instanceUrl, conn.accessToken, userInfo.organizationId])
            //ctx.session.orgId = userInfo.organizationId
        })
    })
}

module.exports = ({
    router
}) => {
    router
        .get('/oauth2/auth', (ctx) => {
            ctx.response.redirect(global.oauth2.getAuthorizationUrl({
                scope: 'api web'
            }))
        })
        .get('oauth', '/auth3/login/return', async (ctx) => {
            var code = ctx.request.query["code"]
            let decrypt = await private_gettoken(code)
            if (decrypt[0] == true) {
                 //TODO : missing validation if the org already exist.
                sfdcmethods.saveUserOrg(ctx.session.passport.user.id, decrypt[3],decrypt[1])
                ctx.session.accesscode = decrypt[2]
                ctx.session.instanceUrl = decrypt[1]
                ctx.session.orgId = decrypt[3]
                ctx.redirect('/welcome')
            }else{
                ctx.redirect('/index')
            }
        })
        .get('logout', '/logout', (ctx) => {
            conn.logout(function (err) {
                if (err) {
                    return console.error(err);
                }
                ctx.session = null
            });
            return ctx.render('index')
        })
        .get('showObjects', '/showObject', async (ctx) => {
            try {
                var result = await global.pool.query('SELECT sobjectdescribe FROM orginformation WHERE orgid = $1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY', [ctx.session.orgId])
                return ctx.render('/show/show_objects', {
                    allObject: result.rows[0]["sobjectdescribe"]["allObject"],
                    totalObject: result.rows[0]["sobjectdescribe"]["allObject"].length,
                    moreObject: result.rows[0]["sobjectdescribe"].morethan100,
                    lessObject: result.rows[0]["sobjectdescribe"].lessthan100
                })
            } catch (err) {
                console.error("Error [getAllObjects] " + err)
            }
        })
        .post('everything', '/everything', async (ctx) => {
            try {
                const result = await sfdcbackground_methods.letsGetEverything(ctx.session)
                console.log("***  : "  +result)
                ctx.body ={ data: result}
            } catch (err) {
                console.error("Error [everything]:" + err)
            }
        })
        .get('showRecordType', '/showRecordType', async (ctx) => {
            try {
                const result = await sfdcmethods.selectAll_RecordTypesByOrder(ctx.session)

                const range = _(result.rows).groupBy('objecttype').partition(function (item) {
                    return item.length > 5
                }).value()

                const recordType_NotActive = _.partition(result.rows, 'active')

                return ctx.render('/show/show_recordType', {
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
                const result = await global.pool.query("SELECT profile_user FROM orginformation where orgid = $1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY",[ctx.session.orgId])

                const range = _.partition(result.rows[0]["profile_user"]["undefined"], function (item) {
                    return item.Total >= 10;
                })

                const profileWithOnly_1User = _.partition(result.rows[0]["profile_user"]["undefined"], function (item) {
                    return item.Total == 1;
                })

                return ctx.render('/show/show_profiles', {
                    profiles: result.rows[0]["profile_user"]["undefined"],
                    morethan10: range[0].length,
                    lessthan10: range[1].length,
                    totalObject: result.rows[0]["profile_user"]["undefined"].length,
                    singleuser: profileWithOnly_1User[0].length
                })
            } catch (error) {
                console.error("Error [showProfiles]: " + error)
            }
        })
        .get('showApexTrigger', '/getApexTrigger', async (ctx) => {
            try {
                const result = await global.pool.query("SELECT apextrigger FROM orginformation WHERE orgid = $1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY", [ctx.session.orgId])
                const range = _(result.rows[0]["apextrigger"].records).groupBy('EntityDefinitionId').value()
                const rangeCondition = _(result.rows[0]["apextrigger"].records).groupBy('EntityDefinitionId').partition(function (item) {
                    return item.length > 5
                }).value()

                const notActive = _.partition(result.rows[0]["apextrigger"].records, function (item) {
                    return item.Status == "Active"
                })

                return ctx.render('/show/show_apexTrigger', {
                    type: "ApexTrigger",
                    apex: result.rows[0]["apextrigger"].records,
                    subheader: Object.keys(range),
                    subcontent: Object.values(range),
                    morethan: rangeCondition[0].length,
                    lessthan: rangeCondition[1].length,
                    notactive: notActive[1].length
                })
            } catch (error) {
                console.error("Error [showApexTrigger]: " + error)
            }
        })
        .get('showApexComponent', '/getApexComponent', async (ctx) => {
            try {
                const result = await global.pool.query("SELECT apexcomponent FROM orginformation WHERE orgid = $1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY", [ctx.session.orgId])
               
                return ctx.render('/show/show_apexComponent', {
                    apex: result.rows[0]["apexcomponent"].records,
                })
            } catch (error) {
                console.error("Error [showApexComponent]: " + error)
            }
        })
        .get('showApexPage', '/getApexPage', async (ctx) => {
            try {
                const result = await global.pool.query("SELECT apexpage FROM orginformation WHERE orgid=$1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY", [ctx.session.orgId])
                return ctx.render('/show/show_apexPage', {
                    apex: result.rows[0]["apexpage"].records
                })
            } catch (error) {
                console.error("Error [showApexPage]: " + error)
            }
        })
        .get('showlayout','/getLayout', async (ctx)=>{
            try {
                const result = await global.pool.query("SELECT layout FROM orginformation WHERE orgid=$1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY", [ctx.session.orgId])
                return ctx.render('/show/show_layouts',{
                    layouts:  result.rows[0]["layout"].records
                })
            } catch (error) {
                console.error("Error [showlayout]: " +error )
            }
        })

        .get('showSecurityRisk', '/showSecurityRisk', async (ctx) => {
            const result = await sfdcmethods.getSecurityRisk('', ctx.session)
            return ctx.render('/show/show_securityrisk', {
                highrisk: result[1],
                otherrisk: result[0]
            })
        })
        .get('showCustomApp', '/showCustomApp', async (ctx) => {
            const result = await sfdcmethods.getCustomApps('', ctx.session)
            return ctx.render('/show/show_customapp', {
                result: result
            })
        })

        .get('showChart', '/getChart', async (ctx) => {
            var abc = "classDiagram\n" + "Animal <|-- Duck"
            //console.log(ctx.query)
            const result = await sfdcmethods.get_childRelationship(ctx.query["t"], ctx.session)
            return ctx.render('/show/show_chart', {
                chart: result
            })
        })

        .post('deleteConnectedOrg','/deleteOrg', async (ctx) => {
            const result = await sfdcmethods.deleteUserOrg(ctx.request.body.id)
        })

        .get('showprocess', '/showprocess', async (ctx) => {    
            const result = await sfdcmethods.getAllProcessAndFlowByType(ctx.session)
           return ctx.render('/show/show_processflow',{
               flows: result[0].flow,
               processes: result[0].process
           })
        })
        //TODO : Test insert into Database and then create UI for it
        .get('testing', '/lance', async (ctx) => {
           const result = await sfdcbackground_methods.getMoreDetails_ProcessbuilderAndFlow()
           await sfdcbackground_methods.insertDataDebugMode(JSON.stringify(result))
        })
}