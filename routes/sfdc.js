const sfdcmethods = require('../sfdc-api')
require('custom-env').env();
const new_sfdc_Background = require("../core/sfdc_background_start");
const {
    Worker,
    isMainThread,
    parentPort,
    workerData
} = require('worker_threads');

const jsforce = require('jsforce')
const _ = require('lodash')

const processbuilder = require('../modules/processbuilder/processbuilder-api')

const dot = require('../modules/processbuilder/dotNotation');
const { OAuth2 } = require('jsforce');
const { env } = require('custom-env');

oauth2 = new jsforce.OAuth2({
    // you can change loginUrl to connect to sandbox or prerelease env.
    loginUrl : 'https://login.salesforce.com',
    clientId: process.env.APP_CLIENTID,
    clientSecret: process.env.APP_SECRET,
    redirectUri: process.env.APP_REDIRECTURL
});

conn = new jsforce.Connection({
    oauth2: oauth2,
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
            ctx.response.redirect(oauth2.getAuthorizationUrl({
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
                ctx.redirect('//p/login_index')
            }
        })
        .get('logout', '/logout', (ctx) => {
            conn.logout(function (err) {
                if (err) {
                    return console.error(err);
                }
                ctx.session = null
            });
            return ctx.render('/p/login_index')
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
                const result = await new_sfdc_Background.start_BackGroundService(ctx.session);
                console.log("***  : "  +result)
                ctx.body ={ data: result};   
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

                const recordType_NotActive = _.partition(result.rows, 'active');

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
                if (result.rows[0]["profile_user"] == null){
                    return;
                };

                const range = _.partition(result.rows[0]["profile_user"]["undefined"], function (item) {
                    return item.Total >= 10;
                })
                
                const profileWithOnly_1User = _.partition(result.rows[0]["profile_user"]["undefined"], function (item) {
                    return item.Total == 1;
                })

                const result_allProfiles = await global.pool.query("SELECT profile FROM orginformation where orgid = $1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY",[ctx.session.orgId]);

                return ctx.render('/show/show_profiles', {
                    profiles: result.rows[0]["profile_user"]["undefined"],
                    morethan10: range[0].length,
                    lessthan10: range[1].length,
                    totalObject: result.rows[0]["profile_user"]["undefined"].length,
                    singleuser: profileWithOnly_1User[0].length,
                    all_profiles: result_allProfiles.rows[0].profile.records,
                    all_profiles_count: result_allProfiles.rows[0].profile.size
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
       .get ('showObjectRelationship', '/getChart', async (ctx) => {
           const result = await sfdcmethods.get_childRelationshipDetails(ctx.query["t"]);
           const countRelationship = await sfdcmethods.get_childRelationshipDetails_Count(ctx.query["t"]);
           const totalFields = await sfdcmethods.get_childRelationshipDetails_totalFields(ctx.query["t"]);
           const dot_result = dot.convertToDOT(result, ctx.query["t"]);
           const recordType = await sfdcmethods.get_childRelationshipDetails_RecordType(ctx.query["t"]);
           const result_layout = await sfdcmethods.get_childRelationshipDetails_Layout(ctx.query["t"]);

            const processBuilder = require('../modules/processbuilder/processbuilder-api');
            const result_processBuilder = await processBuilder.getProcessByObject(ctx.query["t"]);
           return ctx.render('/show/show_chart',{
               dot_allObject: dot_result,
               allObject : result,
               objectName: ctx.query["t"],
               totalFields: totalFields,
               relationCount: countRelationship,
               recordType: recordType.length,
               layouts: result_layout,
               process: result_processBuilder
           });
       })

       .get('processBuilder', '/process', async (ctx) => {
           const processBuilder = require('../modules/processbuilder/processbuilder-api');
           const processBuilderNode = await processBuilder.demystify_processbuilder(ctx.query["id"],ctx.session.orgId);
           return ctx.render('../views/show/show_process',{
                result: processBuilderNode
           })
       })
       
        .get('compareTest','/compare', async (ctx)=> {
            const compare = require('../modules/compare/compare_changes');
            console.log("**** :" + await compare.compareChanges(8889));
        })
}