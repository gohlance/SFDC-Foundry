const {
    Worker
} = require('worker_threads')

//global Oauth setting
const jsforce = require('jsforce')

const _ = require('lodash')
var oauth2 = new jsforce.OAuth2({
    // you can change loginUrl to connect to sandbox or prerelease env.
    // loginUrl : 'https://test.salesforce.com',
    clientId: '3MVG9i1HRpGLXp.qKwbWJHwmeMEDkgggAcpbAf1Y1O7YvezHR_7aOv00w2a_Vz3gst8vk23v4e3qfLRbkKsFi',
    clientSecret: '5675F7043344E39EC5A402927491DA9040F7C857C7A6F0B4D0AF8D3AE69BA8DF',
    redirectUri: 'https://testingauth123.herokuapp.com/auth3/login/return'
});

const Pool = require('pg-pool')
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Beaver',
    password: 'P@ssw0rd1',
    port: 5432,
    max: 20, // set pool max size to 20
    min: 4
})

//*** Only for Development */
global.instanceUrl = "https://singaporeexchangelimited.my.salesforce.com"
//global.instanceUrl = "https://ap16.salesforce.com"
global.accesscode = "00D46000001Uq6O!AQoAQNwIKS8DVEM9hB2XB6BoT16Cn.5VJ9Kh04btvlsK_JfgmFEeUYQGI9Dr2O9Y5sHp9LTTXK9hGMa1rVNqgFv3etgfwZdY"
global.orgId = "999"

var conn = new jsforce.Connection({
    oauth2: oauth2,
    instanceUrl: global.instanceUrl,
    accessToken: global.accesscode
})

module.exports = {
    //Average Run: 3,637 ms to 4,000 ms
    getAllObjects: getAllObjects,
    getAllApex: getAllApex,
    getAllMeta: getAllMeta,
    getAllLayout,
    getAllProfile,
    getAllRecordType,
    getAllProfile2Layout,
    getAllValidationRules,
    getAllWorkflowRules,
    getAllBusinessProcess,
    getAllCustomApplication,
    letsGetEverything,
    getAllObjectOnce,
    sObjectDescribe,
    getAllCustomObjects,
    selectAll_RecordTypesByOrder
}

async function getAllMeta() {
    try {
        return new Promise((resolve, reject) => {
            conn.metadata.describe().then(response => {
                resolve(response)
            })
        })
    } catch (err) {
        console.log("Error [sfdc-api/getAllMeta]: " + err)
    }
}

async function getAllObjectOnce() {
    try {
        return new Promise((resolve, reject) => {
            conn.describeGlobal(function (err, res) {
                if (err) {
                    return console.log(err)
                }
                console.log('[sfdc-api/getAllObjectsOnce] No of Objects ' + res.sobjects.length)
                resolve(res.sobjects)
            })
        })

    } catch (err) {
        console.log("Error [sfdc-api/getAllObjectsOnce]" + err)
    }
}



async function getAllApex(type) {
    //TODO: Check what can ApexPage, ApexClass and ApexComponent return
    return new Promise((resolve, reject) => {
        var query = ""
        if (type == "ApexTrigger") {
            query = "SELECT Name, TableEnumOrId, NamespacePrefix, ApiVersion, Status, IsValid FROM ApexTrigger"
        } else if (type == "ApexPage") {
            query = "SELECT Name, NamespacePrefix, ApiVersion FROM ApexPage"
        } else if (type == "ApexClass") {
            query = "SELECT Name, NamespacePrefix, ApiVersion, Status, IsValid FROM ApexClass"
        } else if (type == "ApexComponent") {
            query = "SELECT Name, NamespacePrefix, ApiVersion FROM ApexComponent"
        }

        conn.tooling.query(query, function (err, result) {
            if (err) {
                console.log("Error [sfdc-api/getAllApex] : " + err)
            }
            console.log("[sfdc-api/getAllApex] : " + result)
            resolve(result)
        })
    })
}

async function getAllLayout() {
    return new Promise((resolve, reject) => {
        conn.tooling.query("SELECT Name, LayoutType, ManageableState, TableEnumOrId FROM Layout", function (err, result) {
            if (err) {
                console.log("Error [sfdc-api/getAllLayout]: " + err)
            }
            console.log("[sfdc-api/getAllLayout] : " + result)
            resolve(result)
        })
    })
}

//Average 1 seconds
async function getAllProfile() {
    return new Promise((resolve, reject) => {
        conn.tooling.query("SELECT Description, Name FROM Profile", function (err, result) {
            if (err) {
                console.log("Error [sfdc-api/getAllProfile]: " + err)
            }
            console.log("[sfdc-api/getAllProfile] : " + result)
            resolve(result)
        })
    })
}

async function getAllProfile2Layout() {
    return new Promise((resolve, reject) => {
        conn.tooling.query("SELECT LayoutId, ProfileId, RecordTypeId, TableEnumOrId FROM ProfileLayout", function (err, result) {
            if (err) {
                console.log("Error [sfdc-api/getAllProfile2Layout]: " + err)
            }
            console.log("[sfdc-api/getAllProfile2Layout] : " + result)
            resolve(result)
        })
    })
}

async function getAllRecordType() {
    return new Promise((resolve, reject) => {
        conn.tooling.query("SELECT BusinessProcessId, Description, Name, IsActive,ManageableState,SobjectType FROM RecordTYpe", function (err, result) {
            if (err) {
                console.log("Error [sfdc-api/getAllRecordType] : " + err)
            }
            console.log("[sfdc-api/getAllRecordType] : " + result)
            resolve(result)
        })
    })
}

//TODO : May need to do after SOBJECTDESCRIBE.
async function getAllValidationRules() {
    return new Promise((resolve, reject) => {
        conn.tooling.query("SELECT Active, Description,ErrorDisplayField,Id, ManageableState,ValidationName FROM ValidationRule", function (err, result) {
            if (err) {
                console.log("Error [sfdc-api/getAllValidationRules] : " + err)
            }
            console.log("[sfdc-api/getAllValidationRules] : " + result)
            resolve(result)
        })
    })
}
async function getAllWorkflowRules() {
    return new Promise((resolve, reject) => {
        conn.tooling.query("SELECT ManageableState,Name,TableEnumOrId FROM WORKFLOWRULE", function (err, result) {
            if (err) {
                console.log("Error [sfdc-api/getAllWorkflowRules] : " + err)
            }
            console.log("[sfdc-api/getAllWorkflowRules] : " + result)
            resolve(result)
        })
    })
}

async function getAllBusinessProcess() {
    return new Promise((resolve, reject) => {
        conn.tooling.query("SELECT Description,IsActive,ManageableState, Name FROM BusinessProcess", function (err, result) {
            if (err) {
                console.log("Error [sfdc-api/getAllBusinessProcess] : " + err)
            }
            console.log("[sfdc-api/getAllBusinessProcess] : " + result)
            resolve(result)
        })
    })
}

async function getAllCustomApplication() {
    return new Promise((resolve, reject) => {
        conn.tooling.query("SELECT Description,DeveloperName,ManageableState,NavType,UiType FROM CustomApplication", function (err, result) {
            if (err) {
                console.log("Error [sfdc-api/getAllCustomApplication] : " + err)
            }
            console.log("[sfdc-api/getAllCustomApplication] : " + result)
            resolve(result)
        })
    })
}

async function getAllSecruityRisk() {
    return new Promise((resolve, reject) => {
        conn.tooling.query("SELECT RiskType, Setting, SettingGroup, OrgValue, StandardValue FROM SecurityHealthCheckRisks where RiskType=’HIGH_RISK’", function (err, result) {
            if (err) {
                console.log("Error [sfdc-api/getAllCustomApplication] : " + err)
            }
            console.log("[sfdc-api/getAllCustomApplication] : " + result)
            resolve(result)
        })
    })
}

async function getAllCustomObjects() {
    return new Promise((resolve, reject) => {
        conn.metadata.retrieve()
        conn.tooling.query("SELECT CustomHelpId, Description, DeveloperName, ExternalName, ExternalRepository, Language, ManageableState,NamespacePrefix,SharingModel FROM CustomObject", function (err, result) {
            if (err) {
                console.log("Error [sfdc-api/getAllCustomApplication] : " + err)
            }
            console.log("[sfdc-api/getAllCustomApplication] : " + result)
            resolve(result)
        })
    })
}

async function letsGetEverything() {
    try {
        return new Promise((resolve, reject) => {
            const worker = new Worker('./backgroundsvc.js', {
                workerData: {
                    instance: global.instanceUrl,
                    code: global.accesscode
                }
            });
            console.log("Worker Started")
            worker.on('message', (message) => {
                console.log("I am here " + message.status);
                resolve("Success")
            });
            worker.on('error', reject);
            worker.on('exit', (code) => {
                if (code !== 0)
                    reject(new Error(`Worker stopped with exit code ${code}`));
            })
        })
    } catch (error) {
        console.log("Error [sfdc-api/letsGetEverything] : " + error)
    }
}

//33 seconds run time for 2050 objects
async function getAllObjects() {
    try {
        return new Promise((resolve, reject) => {
            conn.describeGlobal(function (err, res) {
                if (err) {
                    return console.log(err)
                }
                console.log('[sfdc-api/getAllObjects] No of Objects ' + res.sobjects.length)
                //pool.query("INSERT INTO objects (orgid, objectinfo) VALUES ($1, $2) RETURNING id", [global.orgId, JSON.stringify(res)])
                resolve(res.sobjects)
            })
        })

    } catch (err) {
        console.log("Error [sfdc-api/getAllObjects]" + err)
    }
}



async function sObjectDescribe(result) {
    console.log(result.length)
    var result2 = filter_BeforeCallingAPI(result)
    //console.log(result);
    //TODO : this section can do child relationship
    try {
            var i = 0;
            var lessthan100fields = 0;
            var morethan100fields = 0;
            const pLimit = require('p-limit');
            const limit = pLimit(100);
            console.log("I am here sobjectDescribe")
            var i = 1
            var allObjectTotalFields = await Promise.all(result2.map(async (item) => limit(async () => {
                var totalfields = await conn.sobject(item.name).describe().then(async response => {
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

                if (totalfields.totalfields > 100) {

                    morethan100fields++
                } else {

                    lessthan100fields++
                }

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
                    undeletable: totalfields.undeletable
                }
            })))
            var jsonResult = {
                allObject: allObjectTotalFields,
                morethan100: morethan100fields,
                lessthan100: lessthan100fields
            }
            console.log("[SobjectDescribe - Inserting Record Operation]")
            pool.query("INSERT INTO objects (orgid, objectinfo) VALUES ($1, $2) RETURNING id",[global.orgId,JSON.stringify(jsonResult)])
           console.log("[SobjectDescribe - Inserting Completed]")
       
    } catch (err) {
        console.log("Error [sfdc-api/sObjectDescribe]" + err)
    }
}

//PRIVATE
function chunkArrayInGroups(arr, size) {
    return new Promise((resolve, reject) => {
        var myArray = [];
        var tempArry = arr
        for (var i = 0; i < tempArry.length; i++) {
            if (tempArry[i].includes('SBQQ')) {
                tempArry.splice(i, 1);
            }
        }

        for (var i = 0; i < tempArry.length; i += size) {
            myArray.push(tempArry.slice(i, i + size));
        }
        resolve(myArray)
    });
}

function filter_BeforeCallingAPI (result){
    console.log("result : " + result.length)
    var custom_is_false = _.filter(result, function (o){
        if (o.custom == false)
        return o
    })
    console.log ("*******************")
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

    return createable_is_true
}

async function filter_RecordTypesBy (sobjectname){
    let result = await global.pool.query("select elem from public.recordtypes, lateral jsonb_array_elements(recordtype ->'records') elem where elem @> '{\"SobjectType\":\"$1\"}' and orgid = $2;", [sobjectname,global.orgId])
    //result.rows[0].elem
    return result
  }

async function selectAll_RecordTypesByOrder(){
    let result = await global.pool.query("select elem-> 'Name' as name, elem -> 'SobjectType' as objectType, elem->'IsActive' as active, elem->'Description' as description, elem -> 'BusinessProcessId' as businessprocessid from public.recordtypes, lateral jsonb_array_elements(recordtype -> 'records') elem where orgid = $1 order by 2",[global.orgId])
    return result
}

/**
 * Get metadata for profiles and for layouts. The layouts metadata provides you a full list of page layouts across all objects, while the profile files contain the info on which page layout/record type combos the profile is associated with.

Compare the profiles' assignments to page layouts to the list of page layouts. I did this using some scripting code which parsed through the xml files.
 */

/**
 * Objects - Triggers on Same Event
 * Objects - Validation Rules Active
 */