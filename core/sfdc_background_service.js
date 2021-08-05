const {
    workerData,
    parentPort
} = require('worker_threads');

const sfdc_connect = require('./sfdc_connect');

async function start() {
    try {
        sfdc_connect.set_ConnObject(workerData);
        let newRowID = await sfdc_connect.insert_blankRow(workerData.orgId);
        console.log("*** New Row :" + JSON.stringify(newRowID));
        Promise.all([
            sfdc_connect.get_MetaData(newRowID),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.ApexClass, newRowID),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.ApexComponent, newRowID),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.ApexPage, newRowID),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.ApexTrigger, newRowID),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.BusinessProcess, newRowID),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.CustomApplication, newRowID),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.Flow, newRowID),
            sfdc_connect.getMoreDetails_ProcessbuilderAndFlow( newRowID),
            //sfdc_connect.toolingQuery(sfdc_connect.queryType.FlowandProcessDetails, newRowID),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.Layout, newRowID),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.Profile, newRowID),
            //sfdc_connect.toolingQuery(sfdc_connect.queryType.ProfileLayout),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.RecordType, newRowID),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.SecurityRisk, newRowID),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.ValidationRule, newRowID),
            sfdc_connect.toolingQuery(sfdc_connect.queryType.WorkflowRule, newRowID),
            sfdc_connect.get_TotalUsersByProfile(newRowID),
            sfdc_connect.getUserLicense(newRowID),
            sfdc_connect.get_Org_limitInfo(workerData.accesscode, workerData.instance, newRowID),
            sfdc_connect.getAllObjectOnce(newRowID) 
        ]).then(()=>{
            parentPort.postMessage({
                status: 'Done'
            });
        }           
        );
    } catch (error) {
        console.log("Start () - Error " + error);
    }
}

try {
    start();
} catch (error) {
    console.log("Error " + error);
}