const jsforce = require('jsforce');
const _ = require('lodash');
const _query = require('./sfdc_connect_query');

//Pg Connection String
const Pool = require('pg-pool')
let pool;
if (process.env.APP_ENV == "dev") {
    pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'Beaver2',
      password: 'P@ssw0rd1',
      port: 5432,
      max: 20, // set pool max size to 20
      min: 4
    })
  } else {
    pool = new Pool({
      user: 'bxhbybpvxuyesk',
      host: 'ec2-54-174-221-35.compute-1.amazonaws.com',
      database: 'detjik593i3enh',
      password: '6ec25f57a5d561b4a6eb6e8cd93b8de3f1dbae20fed0dc55b484637bd7ef1489',
      port: 5432,
      max: 20, // set pool max size to 20
      min: 4,
      ssl: { //Changes for heroku pg8 issue
        rejectUnauthorized: false
      }
    })
  }
//End Pg Connection String

//JSFORCE Init Section
let oauth2 = new jsforce.OAuth2({
    // you can change loginUrl to connect to sandbox or prerelease env.
    // loginUrl : 'https://test.salesforce.com',
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    redirectUri: process.env.redirectUri
});

let conn = new jsforce.Connection({
    oauth2: oauth2,
    version: '51.0'
    // instanceUrl: global.instanceUrl,
    // accessToken: global.accesscode
})

const axios = require('axios');

function set_ConnObject(workerData) {
    conn.accessToken = workerData.accesscode
    conn.instanceUrl = workerData.instance
}
//JSFORCE Init Section End

async function toolingQuery(queryType, rowId){
    try {
            let query = _query.selectQuery(queryType);
            conn.tooling.query(query, function (error, result){
                if (error){
                    console.log("Error @ toolingQuery - " + queryType + " : " + error);
                }
                let update = _query.updateQuery(queryType);
                pool.query(update,[result, rowId]); 
            })
    } catch (error) {
        console.log("Error @ toolingQuery (m) - " + queryType + " : " + error);
    }
}

async function get_MetaData(rowId){
    try {
        conn.metadata.describe().then(response => {
            //console.log("[sfdc-api/getAllMeta] : " + response)
            let update = _query.updateQuery("meta");
            pool.query(update, [response, rowId]);
        }) 
    } catch (error) {
        console.error("Error [sfdc-api/getAllMeta]: " + error)
    }
}

async function getAllObjectOnce(rowId) {
    try {
        conn.describeGlobal(async function (err, res) {
            if (err) {
                return console.error("Error [sfdc-api/getAllObjectsOnce - describeGlobal] : " + err)
            }
            console.log('[sfdc-api/getAllObjectsOnce] No of Objects ' + res.sobjects.length)
            let update_query1 = _query.updateQuery("objInfo");
            pool.query(update_query1, [JSON.stringify(res.sobjects), rowId]);
            
            //console.log("GetAllObject Once : " + res)
            jsonResult = await _sObjectDescribe(res.sobjects);
            let update = _query.updateQuery("sobject");
            pool.query(update, [jsonResult, rowId]);
            console.log("GetAllObject Once Returning")
            //console.log("Res.Sobject: " + res.sobjects);
            //console.log("JsonReuslt : " + jsonResult);
            
            //resolve([res.sobjects, jsonResult])
            
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllObjectsOnce] : " + error)
        pool.query("INSERT INTO errorlogs (description) VALUES ($1)",[error]);
    }
}

async function getUserLicense(rowId) {
    try {
        conn.query("SELECT LicenseDefinitionKey, MasterLabel, Name, Status, TotalLicenses, UsedLicenses,UsedLicensesLastUpdated FROM UserLicense", function (err, result) {
            if (err) {
                return console.error("Error : " + err)
            }
            //console.log("[sfdc-api/get_UserWithLicense2] : " + result.records)
            //resolve(result.records)
            let update = _query.updateQuery("license");
            pool.query(update,[JSON.stringify(result.records), rowId]);
        })
        
    } catch (error) {
        console.error("Error [sfdc-api/get_UserWithLicense2] : " + error)
    }
}
async function get_Org_limitInfo(accesscode, instanceurl) {
    try {
        const headers = {
            'Authorization': 'Bearer ' + accesscode,
            'X-PrettyPrint': 1,
        };
        return await axios.get( instanceurl + '/services/data/v51.0/limits/', {
            headers
        })
    } catch (error) {
        console.error("Error [sfdc-api/get_Org_limitInfo] : " + error)
    }
}
async function get_TotalUsersByProfile(rowId) {
    try {
        conn.query("select count(id) Total ,profile.name from user  WHERE Profile.UserLicense.Name != null group by profile.name", function (err, result) {
            if (err) {
                return console.error("Error " + err)
            }
            let totalUserLicense = _(result.records).groupBy('Profile.UserLicense.Name').value()
            //console.log("[sfdc-api/get_TotalUsersByProfile] : " + totalUserLicense)
            let update = _query.updateQuery("userProfile");
            pool.query(update, [totalUserLicense,rowId]);
        });
    } catch (error) {
        console.error("Error [sfdc-api/get_TotalUsersByProfile] : " + error)
    }
}
//Private Methods
async function _sObjectDescribe(result) {
    var result2 = filter_BeforeCallingAPI(result)
    //console.log(result);
    console.log("I am starting SobjectDescribe")
    //TODO : this section can do child relationship
    try {
        let lessthan100fields = 0;
        let morethan100fields = 0;
        const pLimit = require('p-limit');
        const limit = pLimit(100);

        let allObjectTotalFields = await Promise.all(result2.map(async (item) => limit(async () => {
            var totalfields = await conn.sobject(item.name).describe().then(async response => {
                return {
                    totalfields: response.fields.length,
                    layout: response.namedLayoutInfos.length,
                    childRelationships: response.childRelationships.length,
                    recordType: response.recordTypeInfos.length,
                    createable: response.createable,
                    deletable: response.deletable,
                    childRelationship_details: response.childRelationships,
                    undeletable: response.undeletable
                }
            })

            if (totalfields.totalfields > 100) {
                morethan100fields++
            } else {
                lessthan100fields++
            }

            console.log("Total Fields : " + totalfields);

            return {
                Objectname: item.name,
                totalfields: totalfields.totalfields,
                Custom: item.custom,
                Label: item.label,
                childRelationships: totalfields.childRelationships,
                recordType: totalfields.recordType,
                layout: totalfields.layout,
                createable: totalfields.createable,
                deletable: totalfields.deletable,
                undeletable: totalfields.undeletable,
                childRelationship_details: totalfields.childRelationship_details
            }
        })))
        let jsonResult = {
            allObject: allObjectTotalFields,
            morethan100: morethan100fields,
            lessthan100: lessthan100fields
        }

        return jsonResult

    } catch (err) {
        console.log("Error [sfdc-api/sObjectDescribe]" + err)
    }
}

function filter_BeforeCallingAPI(result) {
    console.log("result : " + result.length)
    var custom_is_false = _.filter(result, function (o) {
        if (o.custom == false)
            return o
    })
    console.log("*******************")
    console.log(custom_is_false.length)

    var layoutable_is_true = _.filter(custom_is_false, function (i) {
        if (i.layoutable == true) {
            return i
        }
    })

    console.log(layoutable_is_true.length)

    var createable_is_true = _.filter(layoutable_is_true, function (i) {
        if (i.createable == true) {
            return i
        }
    })

    console.log(createable_is_true.length)

    return createable_is_true
}

async function insert_blankRow(orgid){
    const _newRow = "INSERT INTO orginformation (orgid) VALUES ( $1 ) RETURNING id ";
    let sql_id = await pool.query(_newRow,[orgid]);
    return sql_id.rows[0].id;
}
//Private Methods End

module.exports = {
    toolingQuery,
    get_MetaData,
    set_ConnObject,
    getUserLicense,
    get_Org_limitInfo,
    get_TotalUsersByProfile,
    getAllObjectOnce,
    insert_blankRow
}

const Type = {
    ApexTrigger: "apexTrigger", 
    ApexPage: "apexPage",
    ApexClass: "apexClass",
    ApexComponent: "apexComponent",
    Layout: "layout",
    Profile: "profile",
    ProfileLayout: "profileLayout",
    RecordType: "recordType",
    ValidationRule: "validationRules",
    WorkflowRule: "workflowRules",
    BusinessProcess: "businessProcess",
    Flow: "flow",
    FlowandProcessDetails: "flowdetails",
    CustomApplication: "customapplication",
    SecurityRisk: "securityRisk",
    NewRow: "newRow"
}

module.exports.queryType = Type;