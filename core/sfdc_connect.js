const jsforce = require('jsforce');
const _ = require('lodash');
const _query = require('./sfdc_connect_query');

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

function set_ConnObject(workerData) {
    conn.accessToken = workerData.accesscode
    conn.instanceUrl = workerData.instance
}
//JSFORCE Init Section End

async function toolingQuery(queryType){
    try {
        return new Promise((resolve) => {
            let query = _query.selectQuery(queryType);
            conn.tooling.query(query, function (error, result){
                if (error){
                    console.log("Error @ toolingQuery - " + queryType + " : " + error);
                }
                resolve(result);
            })
        })
    } catch (error) {
        console.log("Error @ toolingQuery (m) - " + queryType + " : " + error);
    }
}

async function get_MetaData(){
    try {
        return new Promise((resolve) => {
            conn.metadata.describe().then(response => {
                console.log("[sfdc-api/getAllMeta] : " + response)
                resolve(response)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllMeta]: " + error)
    }
}

async function getAllObjectOnce() {
    try {
        return new Promise((resolve, reject) => {
            conn.describeGlobal(async function (err, res) {
                if (err) {
                    return console.error("Error [sfdc-api/getAllObjectsOnce - describeGlobal] : " + err)
                }
                console.log('[sfdc-api/getAllObjectsOnce] No of Objects ' + res.sobjects.length)
                //resolve(res.sobjects)
                console.log("GetAllObject Once : " + res)
                jsonResult = await _sObjectDescribe(res.sobjects)
                
                console.log("GetAllObject Once Returning")
                console.log("Res.Sobject s: " + res.sobjects);
                console.log("JsonReuslt : " + jsonResult);
                
                resolve([res.sobjects, jsonResult])
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllObjectsOnce] : " + error)
    }
}

async function getUserLicense() {
    try {
        return new Promise((resolve, reject) => {
            conn.query("SELECT LicenseDefinitionKey, MasterLabel, MonthlyLoginsEntitlement, MonthlyLoginsUsed, Name, Status, TotalLicenses, UsedLicenses,UsedLicensesLastUpdated FROM UserLicense", function (err, result) {
                if (err) {
                    return console.error("Error : " + err)
                }
                console.log("[sfdc-api/get_UserWithLicense2] : " + result.records)
                resolve(result.records)
            })
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
        return await axios.get(instanceurl + '/services/data/v45.0/limits/', {
            headers
        })
    } catch (error) {
        console.error("Error [sfdc-api/get_Org_limitInfo] : " + error)
    }
}
async function get_TotalUsersByProfile() {
    try {
        return new Promise((resolve, reject) => {
            conn.query("select count(id) Total ,profile.name from user  WHERE Profile.UserLicense.Name != null group by profile.name", function (err, result) {
                if (err) {
                    return console.error("Error " + err)
                }
                let totalUserLicense = _(result.records).groupBy('Profile.UserLicense.Name').value()
                console.log("[sfdc-api/get_TotalUsersByProfile] : " + totalUserLicense)
                resolve(totalUserLicense)
            });
        })
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
//Private Methods End

module.exports = {
    toolingQuery,
    get_MetaData,
    set_ConnObject,
    getUserLicense,
    get_Org_limitInfo,
    get_TotalUsersByProfile,
    getAllObjectOnce
}
module.exports.queryType = _query.Type;