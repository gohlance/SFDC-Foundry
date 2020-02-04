//#region Init Variable
const {
    Worker
} = require('worker_threads')

const jsforce = require('jsforce')

const _ = require('lodash')

var oauth2 = new jsforce.OAuth2({
    // you can change loginUrl to connect to sandbox or prerelease env.
    // loginUrl : 'https://test.salesforce.com',
    clientId: '3MVG9i1HRpGLXp.qKwbWJHwmeMEDkgggAcpbAf1Y1O7YvezHR_7aOv00w2a_Vz3gst8vk23v4e3qfLRbkKsFi',
    clientSecret: '5675F7043344E39EC5A402927491DA9040F7C857C7A6F0B4D0AF8D3AE69BA8DF',
    redirectUri: 'https://warm-garden-23298.herokuapp.com/auth3/login/return'
});

const axios = require('axios')

var conn = new jsforce.Connection({
    oauth2: oauth2
    // instanceUrl: global.instanceUrl,
    // accessToken: global.accesscode
})
//#endregion

module.exports = {
    getAllMeta,
    getAllLayout,
    getAllRecordType,
    getAllProfile,
    get_TotalUsersByProfile,
    getAllProfile2Layout,
    getAllValidationRules,
    getAllWorkflowRules,
    getAllBusinessProcess,
    getAllCustomApplication,
    getAllApex,
    get_UserWithLicense2,
    get_Org_limitInfo,
    getAllObjectOnce,
    sObjectDescribe,
    getAllSecruityRisk,
    letsGetEverything,
    set_ConnObject
}

async function letsGetEverything(session) {
    try {
        return new Promise((resolve, reject) => {
            const worker = new Worker('./svc_background/backgroundsvc.js', {
                workerData: {
                    instance: session.instanceUrl,
                    accesscode: session.accesscode,
                    orgId: session.orgId
                }
            });

            console.log("Worker Started")
            worker.on('message', (message) => {
                //console.log("I am here " + message.status);
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

function set_ConnObject(workerData) {
    conn.accessToken = workerData.accesscode
    conn.instanceUrl = workerData.instance
}

async function getAllMeta() {
    try {
        return new Promise((resolve, reject) => {
            conn.metadata.describe().then(response => {
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
            conn.describeGlobal(function (err, res) {
                if (err) {
                    return console.error("Error [sfdc-api/getAllObjectsOnce - describeGlobal] : " + err)
                }
                console.log('[sfdc-api/getAllObjectsOnce] No of Objects ' + res.sobjects.length)
                resolve(res.sobjects)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllObjectsOnce] : " + error)
    }
}
async function getAllApex(type) {
    try {
        return new Promise((resolve, reject) => {
            var query = ""
            if (type == "ApexTrigger") {
                query = "SELECT Name,BodyCrc,ApiVersion, Status, IsValid, EntityDefinitionId,UsageAfterDelete, UsageAfterInsert,UsageAfterUndelete,UsageAfterUpdate,UsageBeforeDelete,UsageBeforeInsert,UsageBeforeUpdate,UsageIsBulk FROM ApexTrigger"
            } else if (type == "ApexPage") {
                query = "SELECT Name, NamespacePrefix, ApiVersion FROM ApexPage"
            } else if (type == "ApexClass") {
                query = "SELECT Name, NamespacePrefix, ApiVersion, Status, IsValid FROM ApexClass"
            } else if (type == "ApexComponent") {
                query = "SELECT Name, NamespacePrefix, ApiVersion FROM ApexComponent"
            }

            conn.tooling.query(query, function (err, result) {
                if (error) {
                    console.log("Error [sfdc-api/getAllApex - conn.tooling] : " + error)
                }
                console.log("[sfdc-api/getAllApex] : " + result)
                resolve(result)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllApex " + type + " ] : " + error)
    }
}
async function getAllLayout() {
    try {
        return new Promise((resolve, reject) => {
            conn.tooling.query("SELECT Name, LayoutType, ManageableState, TableEnumOrId FROM Layout", function (err, result) {
                if (err) {
                    console.log("Error [sfdc-api/getAllLayout]: " + err)
                }
                console.log("[sfdc-api/getAllLayout] : " + result)
                resolve(result)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllLayout] : " + error)
    }
}
//Average 1 seconds
async function getAllProfile() {
    try {
        return new Promise((resolve) => {
            conn.tooling.query("SELECT Description, Name FROM Profile", function (err, result) {
                if (err) {
                    console.log("Error [sfdc-api/getAllProfile]: " + err)
                }
                console.log("[sfdc-api/getAllProfile] : " + result)
                resolve(result)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllProfile] : " + error)
    }
}
async function getAllProfile2Layout() {
    try {
        return new Promise((resolve, reject) => {
            conn.tooling.query("SELECT LayoutId, ProfileId, RecordTypeId, TableEnumOrId FROM ProfileLayout", function (err, result) {
                if (err) {
                    console.log("Error [sfdc-api/getAllProfile2Layout]: " + err)
                }
                console.log("[sfdc-api/getAllProfile2Layout] : " + result)
                resolve(result)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllProfile2Layout] : " + error)
    }

}
async function getAllRecordType() {
    try {
        return new Promise((resolve, reject) => {
            conn.tooling.query("SELECT BusinessProcessId, Description, Name, IsActive,ManageableState,SobjectType FROM RecordTYpe", function (err, result) {
                if (err) {
                    console.log("Error [sfdc-api/getAllRecordType] : " + err)
                }
                console.log("[sfdc-api/getAllRecordType] : " + result)
                resolve(result)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllRecordType] : " + error)
    }
}
async function getAllValidationRules() {
    try {
        return new Promise((resolve, reject) => {
            conn.tooling.query("SELECT Active, Description,ErrorDisplayField,Id, ManageableState,NamespacePrefix,ValidationName FROM ValidationRule", function (err, result) {
                if (err) {
                    console.log("Error [sfdc-api/getAllValidationRules] : " + err)
                }
                console.log("[sfdc-api/getAllValidationRules] : " + result)
                resolve(result)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllValidationRules] : " + error)
    }
}
async function getAllWorkflowRules() {
    try {
        return new Promise((resolve, reject) => {
            conn.tooling.query("SELECT ManageableState,Name,TableEnumOrId FROM WORKFLOWRULE", function (err, result) {
                if (err) {
                    console.log("Error [sfdc-api/getAllWorkflowRules] : " + err)
                }
                console.log("[sfdc-api/getAllWorkflowRules] : " + result)
                resolve(result)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllWorkflowRules] : " + error)
    }
}
async function getAllBusinessProcess() {
    try {
        return new Promise((resolve, reject) => {
            conn.tooling.query("SELECT Description,IsActive,ManageableState, Name FROM BusinessProcess", function (err, result) {
                if (err) {
                    console.log("Error [sfdc-api/getAllBusinessProcess] : " + err)
                }
                console.log("[sfdc-api/getAllBusinessProcess] : " + result)
                resolve(result)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllBusinessProcess] : " + error)
    }
}
async function getAllCustomApplication() {
    try {
        return new Promise((resolve, reject) => {
            conn.tooling.query("SELECT Description,DeveloperName,ManageableState,NavType,UiType FROM CustomApplication", function (err, result) {
                if (err) {
                    console.log("Error [sfdc-api/getAllCustomApplication] : " + err)
                }
                console.log("[sfdc-api/getAllCustomApplication] : " + result)
                resolve(result)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllCustomApplication] : " + error)
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
                resolve(totalUserLicense)
            });
        })
    } catch (error) {
        console.error("Error [sfdc-api/get_TotalUsersByProfile] : " + error)
    }
}
async function sObjectDescribe(result) {
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
                    childRelatioship: response.childRelationships.length,
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
async function get_UserWithLicense2() {
    try {
        return new Promise((resolve, reject) => {
            conn.query("SELECT LicenseDefinitionKey, MasterLabel, MonthlyLoginsEntitlement, MonthlyLoginsUsed, Name, Status, TotalLicenses, UsedLicenses,UsedLicensesLastUpdated FROM UserLicense", function (err, result) {
                if (err) {
                    return console.error("Error : " + err)
                }
                resolve(result.records)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/get_UserWithLicense2] : " + error)
    }
}
async function get_Org_limitInfo() {
    try {
        const headers = {
            'Authorization': 'Bearer ' + global.accesscode,
            'X-PrettyPrint': 1,
        };
        return await axios.get(global.instanceUrl + '/services/data/v45.0/limits/', {
            headers
        })
    } catch (error) {
        console.error("Error [sfdc-api/get_Org_limitInfo] : " + error)
    }
}

async function getAllSecruityRisk() {
    try {
        return new Promise((resolve, reject) => {
            conn.tooling.query("SELECT RiskType, Setting, SettingGroup, OrgValue, StandardValue FROM SecurityHealthCheckRisks", function (err, result) {
                if (err) {
                    console.log("Error [sfdc-api/getAllCustomApplication] : " + err)
                }
                console.log("[sfdc-api/getAllCustomApplication] : " + result)
                resolve(result)
            })
        })
    } catch (error) {
        console.error("Error [sfdc-api/getAllSecruityRisk] : " + error)
    }
}


//PRIVATE Methods

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