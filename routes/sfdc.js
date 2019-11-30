
//JSFORCE SETUP
const jsforce = require('jsforce')
var oauth2 = new jsforce.OAuth2({
    // you can change loginUrl to connect to sandbox or prerelease env.
    // loginUrl : 'https://test.salesforce.com',
    clientId: '3MVG9i1HRpGLXp.qKwbWJHwmeMEDkgggAcpbAf1Y1O7YvezHR_7aOv00w2a_Vz3gst8vk23v4e3qfLRbkKsFi',
    clientSecret: '5675F7043344E39EC5A402927491DA9040F7C857C7A6F0B4D0AF8D3AE69BA8DF',
    redirectUri: 'https://testingauth123.herokuapp.com/auth3/login/return'
});
//*** Only for Development */
//global.instanceUrl = "https://singaporeexchangelimited.my.salesforce.com"
//global.instanceUrl = "https://ap15.salesforce.com"
//global.accesscode = "00D46000001Uq6O!AQoAQB2Qiea4Koj2rzKTWtlv7bggp3Nkfh2O9FAwWCTWdOXNxcXfUbjqFHuUZIQczWxOlP861wZRy9kgzabF_YZ7BMdYwLWD"

//PG SETUP
const { Client } = require('pg')
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'Beaver',
    password: 'P@ssw0rd1',
    port: 5432,
  })

async function saveToDataBase(query, result){
    client.connect()
    try{
        await client.query('BEGIN')
        console.log("Trying to save the data")
        client.query(query, [result[0],result[1]])

        await client.query('COMMIT')
        await client.end()
    }catch (Error){
        await client.query('ROLLBACK')
        console.log("Database : " + err)
    }
    
}
async function getObjectsInfoFromDB() {
    try{
        client.connect()
        
        var result
        const query = {name: 'fetch-data', text: 'SELECT objectinfo FROM objects WHERE orgid = $1', values: ['123']}
        result = await client.query(query)
        await client.end()
        return result.rows[0]["objectinfo"]
    }catch (err){
        console.log("Error 1: " + err)
    }
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
                
                var something = require('../util')
                var result = await something.getAllObjects(conn)
                if (result == undefined){
                   //result = await getObjectsInfoFromDB()
                }else{
                    //TODO: VERSION CONTROL when adding to database
                    //saveToDataBase("INSERT INTO objects(orgid, objectinfo) VALUES ($1, $2) RETURNING id", ["567",JSON.stringify(result)])
                }
                console.log("%%% : " + result)

                return ctx.render('objects', {
                    allObject: result["allObject"],
                    totalObject: result["allObject"].length,
                    moreObject: result.morethan100,
                    lessObject: result.lessthan100
                })

            } catch (err) {
                console.log("Error: getAllObjects " + err)
            }
        })
        .get('getAllApexTrigger','/getAllApexTrigger', async (ctx)=>{
            try{
                var conn = new jsforce.Connection({
                    oauth2: oauth2,
                    instanceUrl: global.instanceUrl,
                    accessToken: global.accesscode
                })
                
                var something = require('../util')
                var result = await something.getAllApex(conn, "ApexTrigger")

                return ctx.render('apex',{
                    apex: result.records,
                    type: "ApexTrigger"
                })
            }catch (err){
                console.log("Error : " + err)
            }
        })
        .get('getAllApexPage','/getAllApexPage', async (ctx)=>{
            try{
                var conn = new jsforce.Connection({
                    oauth2: oauth2,
                    instanceUrl: global.instanceUrl,
                    accessToken: global.accesscode
                })
                
                var something = require('../util')
                var result = await something.getAllApex(conn, "ApexPage")

                return ctx.render('apex',{
                    apex: result.records,
                    type: "ApexPage"
                })
            }catch (err){
                console.log("Error : " + err)
            }
        })
        .get('getAllApexPage','/getAllApexComponent', async (ctx)=>{
            try{
                var conn = new jsforce.Connection({
                    oauth2: oauth2,
                    instanceUrl: global.instanceUrl,
                    accessToken: global.accesscode
                })
                
                var something = require('../util')
                var result = await something.getAllApex(conn, "ApexComponent")

                return ctx.render('apex',{
                    apex: result.records,
                    type: "ApexComponent"
                })
            }catch (err){
                console.log("Error : " + err)
            }
        })
        .get('getAllApexPage','/getAllApexClass', async (ctx)=>{
            try{
                var conn = new jsforce.Connection({
                    oauth2: oauth2,
                    instanceUrl: global.instanceUrl,
                    accessToken: global.accesscode
                })
                
                var something = require('../util')
                var result = await something.getAllApex(conn, "ApexClass")

                return ctx.render('apex',{
                    apex: result.records,
                    type: "ApexClass"
                })
            }catch (err){
                console.log("Error : " + err)
            }
        })
        .get('getAllMeta','/getAllMeta', async (ctx) => {
            try{
                var conn = new jsforce.Connection({
                    oauth2: oauth2,
                    instanceUrl: global.instanceUrl,
                    accessToken: global.accesscode
                })
                
                var something = require('../util')
                conn.tooling.query("SELECT Name, LayoutType, ManageableState, TableEnumOrId FROM Layout", function(err, result){
                    if (err){console.log(err)}
                    console.log("A: " + result)
                })
                //var result = await something.getAllApexTrigger(conn)
                
//**may need to do query = tooling/query/?q=SELECT+Id+FROM+<<ObjectName>>+WHERE+NamespacePrefix=null*/

//'ApexClass','ApexPage','ApexComponent','ApexTrigger'
//Apex Trigger : ApexTrigger
//EntityDefinitionId = Object Id
/*
conn.tooling.query("SELECT Id, Name, Status,EntityDefinitionId, MetaData FROM ApexTrigger GROUP BY TableEnumOrId").then(response => {
    console.log(response)
})*/
//                conn.metadata.describe().then(response => {
//                    console.log(response)
//                })
                
                //return ctx.render('trigger',{
                //    trigger: result
                //})
            }catch (err){
                console.log("Error : " + err)
            }
        })
}