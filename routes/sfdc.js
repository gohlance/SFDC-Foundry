
//JSFORCE SETUP
const jsforce = require('jsforce')
var sfdcmethods = require('../util')
var oauth2 = new jsforce.OAuth2({
    // you can change loginUrl to connect to sandbox or prerelease env.
    // loginUrl : 'https://test.salesforce.com',
    clientId: '3MVG9i1HRpGLXp.qKwbWJHwmeMEDkgggAcpbAf1Y1O7YvezHR_7aOv00w2a_Vz3gst8vk23v4e3qfLRbkKsFi',
    clientSecret: '5675F7043344E39EC5A402927491DA9040F7C857C7A6F0B4D0AF8D3AE69BA8DF',
    redirectUri: 'https://testingauth123.herokuapp.com/auth3/login/return'
});
//*** Only for Development */
global.instanceUrl = "https://singaporeexchangelimited.my.salesforce.com"
//global.instanceUrl = "https://ap15.salesforce.com"
global.accesscode = "00D46000001Uq6O!AQoAQPZDvf5eZXiANp1DHY_b5vCMCNVANOkOPs6CE8F8nLkHtQus_VvZxlv2r0HtIvddr9DiCrc4a966iQ6O0sjA73c5XTYK"
//global.orgId = "1122019"
global.orgId="567"
//PG SETUP
const Pool = require('pg-pool')
const pgconfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'Beaver',
    password: 'P@ssw0rd1',
    port: 5432,
    max: 20, // set pool max size to 20
    min: 4
}
const pool = new Pool(pgconfig)

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
            var conn = new jsforce.Connection({
                oauth2: oauth2
            })
            conn.logout(function (err) {
                if (err) {
                    return console.error(err);
                }
                // now the session has been expired.
            });
        })
        .get('getAllObjects', '/getAllObjects', async (ctx) => {
            try {
                var conn = new jsforce.Connection({
                    oauth2: oauth2,
                    instanceUrl: global.instanceUrl,
                    accessToken: global.accesscode
                })
                
                var result = await sfdcmethods.getAllObjects(conn)
                if (result == undefined){
                   result = await pool.query('SELECT objectinfo FROM objects WHERE orgid = $1',[global.orgId])
                }else{
                    //TODO: VERSION CONTROL when adding to database
                   await pool.query("INSERT INTO objects(orgid, objectinfo) VALUES ($1, $2) RETURNING id", [global.orgId,JSON.stringify(result)])
                }
                console.log("%%% : " + result)

                return ctx.render('objects', {
                    allObject: result.rows[0]["objectinfo"]["allObject"],
                    totalObject: result.rows[0]["objectinfo"]["allObject"].length,
                    moreObject: result.rows[0]["objectinfo"].morethan100,
                    lessObject: result.rows[0]["objectinfo"].lessthan100
                })

            } catch (err) {
                console.log("Error [getAllObjects] " + err)
            }
        })
        .get('getAllApexTrigger','/getAllApexTrigger', async (ctx)=>{
            try{
                var conn = new jsforce.Connection({
                    oauth2: oauth2,
                    instanceUrl: global.instanceUrl,
                    accessToken: global.accesscode
                })
                
                var result = await sfdcmethods.getAllApex(conn, "ApexTrigger")
                
                
                return ctx.render('apex',{
                    apex: result.records,
                    type: "ApexTrigger"
                })
            }catch (err){
                console.log("Error [getAllApexTrigger]: " + err)
            }
        })
        .get('getAllApexPage','/getAllApexPage', async (ctx)=>{
            try{
                var conn = new jsforce.Connection({
                    oauth2: oauth2,
                    instanceUrl: global.instanceUrl,
                    accessToken: global.accesscode
                })
                
                var result = await sfdcmethods.getAllApex(conn, "ApexPage")

                return ctx.render('apex',{
                    apex: result.records,
                    type: "ApexPage"
                })
            }catch (err){
                console.log("Error [getAllApexPage]: " + err)
            }
        })
        .get('getAllApexPage','/getAllApexComponent', async (ctx)=>{
            try{
                var conn = new jsforce.Connection({
                    oauth2: oauth2,
                    instanceUrl: global.instanceUrl,
                    accessToken: global.accesscode
                })
                var result = await sfdcmethods.getAllApex(conn, "ApexComponent")

                return ctx.render('apex',{
                    apex: result.records,
                    type: "ApexComponent"
                })
            }catch (err){
                console.log("Error [getAllApexComponet]: " + err)
            }
        })
        .get('testing','/testing', async (ctx)=>{
            var conn = new jsforce.Connection({
                oauth2: oauth2,
                instanceUrl: global.instanceUrl,
                accessToken: global.accesscode
            })
            conn.describeGlobal().then(response => {
                console.log(response)
                await Promise.all(response.map(async (item) => {
                    var totalfields = await conn.sobject(item.name).describe().then(async response => {
                        /**
                         * activateable: false, <---
      createable: false,
      custom: false,
      customSetting: false,
      deletable: false,
      deprecatedAndHidden: false,
      feedEnabled: false,
      hasSubtypes: false,
      isSubtype: false,
      keyPrefix: null,
      label: 'Note',
      labelPlural: 'Notes',
      layoutable: false,
      mergeable: false,
      mruEnabled: false,
      name: 'AttachedContentNote',
      queryable: false,
      replicateable: false,
      retrieveable: false,
      searchable: false, <---
      triggerable: false,  <----
      undeletable: false,
      updateable: false, <----
      urls: [Object]
                         */
                        return {
                            totalfields: response.fields.length,
                            layout: response.namedLayoutInfos.length,
                            childRelatioship: response.childRelationships.length,
                            recordType: response.recordTypeInfos.length,
                            createable: response.createable,
                            deletable: response.deletable,
                            undeletable: response.undeletable
                        }
                    })
                })
            })
        })
        .get('getAllApexPage','/getAllApexClass', async (ctx)=>{
            try{
                var conn = new jsforce.Connection({
                    oauth2: oauth2,
                    instanceUrl: global.instanceUrl,
                    accessToken: global.accesscode
                })
                
                var result = await sfdcmethods.getAllApex(conn, "ApexClass")

                return ctx.render('apex',{
                    apex: result.records,
                    type: "ApexClass"
                })
            }catch (err){
                console.log("Error [getAllApexClass] : " + err)
            }
        })
        .get('getAllMeta','/getAllMeta', async (ctx) => {
            try{
                var conn = new jsforce.Connection({
                    oauth2: oauth2,
                    instanceUrl: global.instanceUrl,
                    accessToken: global.accesscode
                })
                
                var result = await sfdcmethods.getAllMeta(conn)
                if (result == undefined){
                    result = await pool.query("SELECT meta FROM metas WHERE orgid = $1",[global.orgId])
                 }else{
                     //TODO: VERSION CONTROL when adding to database
                     await pool.query("INSERT INTO metas (orgid, meta) VALUES ($1, $2) RETURNING id", [global.orgId,JSON.stringify(result)])
                 }
                
            }catch (err){
                console.log("Error [getAllMeta]: " + err)
            }
        })
        .get('getAllLayout','/getAllLayout', async (ctx)=>{
            try{
                var conn = new jsforce.Connection({
                    oauth2: oauth2,
                    instanceUrl: global.instanceUrl,
                    accessToken: global.accesscode
                })
                var result =await sfdcmethods.getAllLayout(conn)

                if (result == undefined){
                    //result = await getObjectsInfoFromDB()
                 }else{
                     //TODO: VERSION CONTROL when adding to database
                     saveToDataBase("INSERT INTO layouts (orgid, layoutinfo) VALUES ($1, $2) RETURNING id", [global.orgId,JSON.stringify(result)])
                 }
            }catch (err){
                console.log("Error [getAllLayout]:" + err)
            }
        })
}