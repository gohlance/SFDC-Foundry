const {
    workerData,
    parentPort
} = require('worker_threads');

const sfdc_connect = require('./sfdc_connect');

async function start() {
    try {
        sfdc_connect.set_ConnObject(workerData);

        Promise.all([
            sfdc_connect.get_MetaData(),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.ApexClass),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.ApexComponent),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.ApexPage),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.ApexTrigger),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.BusinessProcess),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.CustomApplication),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.Flow),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.FlowandProcessDetails),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.Layout),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.Profile),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.ProfileLayout),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.RecordType),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.SecurityRisk),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.ValidationRule),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.WorkflowRule),
            sfdc_connect.get_TotalUsersByProfile(),
            sfdc_connect.getUserLicense(),
            sfdc_connect.get_Org_limitInfo(workerData.accessCode, workerData.instance),
            sfdc_connect.getAllObjectOnce()
        ]).then(([
            _meta,_apexClass, _apexComponent, _apexPage, _apexTrigger, _businessProcess, _customApplication, _flow, _flowDetails, _layout, _profile, _profilelayout, _recordType, _securityRisk, _validationRule, _workflowRule, _userByProfile, _license, _orglimit, _objectInfo
        ]) => {
            insertData(worker.orgId, _meta, _apexClass, _apexComponent, _apexPage, _apexTrigger, _businessProcess, _customApplication, _flow, _flowDetails, _layout, _profile, _profilelayout, _recordType, _securityRisk, _validationRule, _workflowRule, _userByProfile, _license, _orglimit, _objectInfo[0],_objectInfo[1]);
        });
    } catch (error) {
        console.log("Start () - Error " + error);
    }
}

//Private Methods
async function insertData(orgid, meta, apexclass, apexcomponent, apexpage, apextrigger, businessprocess, customapp,  processflow, processflow_meta, layout, profile, profilelayout, recordtype, securityrisk, validationRules,   workflowrules, userbyProfile, license, orglimit, objectinfo, sobject){
    try {
        let sql_id = await pool.query("INSERT INTO orginformation (orgid, metainformation, objectinformation, orgLicenseInformation, orgLimitsInformation, orgSecurityRisk, sobjectdescribe, apextrigger, apexpage, apexclass, apexcomponent, profile, profile_user, layout, profileslayout, customAppn, businessprocess, workflowrule, validationrule, recordtype, processflow, processflow_metadata) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22) RETURNING id",[orgid, JSON.stringify(meta), JSON.stringify(objectinfo), JSON.stringify(license), JSON.stringify(orglimit), JSON.stringify(securityrisk), JSON.stringify(sobject), JSON.stringify(apextrigger), JSON.stringify(apexpage), JSON.stringify(apexclass), JSON.stringify(apexcomponent), JSON.stringify(profile), JSON.stringify(userbyProfile), JSON.stringify(layout), JSON.stringify(profilelayout), JSON.stringify(customapp), JSON.stringify(businessprocess), JSON.stringify(workflowrules), JSON.stringify(validationRules), JSON.stringify(recordtype), JSON.stringify(processflow), JSON.stringify(processflow_meta)]);

        console.log("Returning ID from SQL insert : " + sql_id);
     } catch (error) {
         console.log("Error from SQL : " + error);
     }
}
//Private Methods End

start();