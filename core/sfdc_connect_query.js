module.exports = {
    selectQuery, updateQuery
};

const _apexTrigger = "SELECT Name,BodyCrc,ApiVersion, Status, IsValid, EntityDefinitionId,UsageAfterDelete, UsageAfterInsert,UsageAfterUndelete,UsageAfterUpdate,UsageBeforeDelete,UsageBeforeInsert,UsageBeforeUpdate,UsageIsBulk FROM ApexTrigger";
const _apexPage = "SELECT Name, NamespacePrefix, ApiVersion FROM ApexPage";
const _apexClass = "SELECT Name, NamespacePrefix, ApiVersion, Status, IsValid FROM ApexClass";
const _apexComponent = "SELECT Name, NamespacePrefix, ApiVersion FROM ApexComponent";

const _layout = "SELECT Name, LayoutType, ManageableState, TableEnumOrId FROM Layout";
const _profile = "SELECT Description, Name FROM Profile";
//This is not in used
const _profileLayout = "SELECT LayoutId, ProfileId, RecordTypeId, TableEnumOrId FROM ProfileLayout;"
const _recordType = "SELECT BusinessProcessId, Description, Name, IsActive,ManageableState,SobjectType FROM RecordType";

const _validationRule = "SELECT Active, Description,ErrorDisplayField,Id, ManageableState,NamespacePrefix,ValidationName FROM ValidationRule";
const _workFlowRule = "SELECT ManageableState,Name,TableEnumOrId FROM WorkflowRule";
const _businesProcess = "SELECT Description,IsActive,ManageableState, Name FROM BusinessProcess";
const _flow = "SELECT DefinitionId, Description, IsTemplate, ManageableState, MasterLabel, ProcessType, RunInMode, Status, VersionNumber FROM FLOW";
const _flowProcessDetails = "SELECT DefinitionId, VersionNumber, Status FROM FLOW WHERE Status = 'Active' GROUP BY DefinitionId, VersionNumber, Status ORDER BY DefinitionId";
const _customApplication = "SELECT Description,DeveloperName,ManageableState,NavType,UiType FROM CustomApplication";

const _securityRisk = "SELECT RiskType, Setting, SettingGroup, OrgValue, StandardValue FROM SecurityHealthCheckRisks";

function selectQuery(selector){
    switch(selector){
        case "apexTrigger":
            return _apexTrigger;
        case "apexPage":
            return _apexPage;
        case "apexClass":
            return _apexClass;
        case "apexComponent":
            return _apexComponent;
        case "layout":
            return _layout;
        case "profile":
            return _profile;
        case "profileLayout":
            return _profileLayout;
        case "recordType":
            return _recordType;
        case "validationRules":
            return _validationRule;
        case "workflowRules":
            return _workFlowRule;
        case "businessProcess":
            return _businesProcess;
        case "flow":
            return _flow;
        case "flowdetails":
            return _flowProcessDetails;
        case "customapplication":
            return _customApplication;
        case "securityRisk":
            return _securityRisk;
    }
}

const _update_apexTrigger = "UPDATE orginformation SET apextrigger = $1 WHERE id = $2";
const _update_apexPage = "UPDATE orginformation SET apexpage = $1 WHERE id = $2";
const _update_apexClass = "UPDATE orginformation SET apexclass = $1 WHERE id = $2";
const _update_apexComponent = "UPDATE orginformation SET apexcomponent = $1 WHERE id = $2";

const _update_layout = "UPDATE orginformation SET layout = $1 WHERE id = $2";
const _update_profile = "UPDATE orginformation SET profile = $1 WHERE id = $2";
//This is not in used
const _update_profileLayout = "SELECT LayoutId, ProfileId, RecordTypeId, TableEnumOrId FROM ProfileLayout";
const _update_recordType = "UPDATE orginformation SET recordtype = $1 WHERE id = $2";

const _update_validationRule = "UPDATE orginformation SET validationrule = $1 WHERE id = $2";
const _update_workFlowRule = "UPDATE orginformation SET workflowrule = $1 WHERE id = $2";
const _update_businesProcess = "UPDATE orginformation SET businessprocess = $1 WHERE id = $2";
const _update_flow = "UPDATE orginformation SET processflow = $1 WHERE id = $2";
const _update_flowProcessDetails = "UPDATE orginformation SET processflow_metadata = $1 WHERE id = $2";
const _update_customApplication = "UPDATE orginformation SET customappn = $1 WHERE id = $2";

const _update_securityRisk = "UPDATE orginformation SET orgsecurityrisk = $1 WHERE id = $2";
const _update_meta = "UPDATE orginformation SET metainformation = $1 WHERE id = $2";
const _update_profile_user = "UPDATE orginformation SET profile_user = $1 WHERE id = $2"
const _update_objInfo = "UPDATE orginformation SET objectinformation =$1 WHERE id =$2";
const _update_sobject = "UPDATE orginformation SET sobjectdescribe =$1 WHERE id =$2";

const _update_license = "UPDATE orginformation SET orgLicenseInformation = $1 WHERE id = $2";
const _update_orglimit = "UPDATE orginformation SET orglimitsinformation = $1 WHERE id = $2";

function updateQuery(selector){
    switch(selector){
        case "meta":
            return _update_meta;
        case "apexTrigger":
            return _update_apexTrigger;
        case "apexPage":
            return _update_apexPage;
        case "apexClass":
            return _update_apexClass;
        case "apexComponent":
            return _update_apexComponent;
        case "layout":
            return _update_layout;
        case "profile":
            return _update_profile;
        case "profileLayout":
            return _update_profileLayout;
        case "recordType":
            return _update_recordType;
        case "validationRules":
            return _update_validationRule;
        case "workflowRules":
            return _update_workFlowRule;
        case "businessProcess":
            return _update_businesProcess;
        case "flow":
            return _update_flow;
        case "flowdetails":
            return _update_flowProcessDetails;
        case "customapplication":
            return _update_customApplication;
        case "securityRisk":
            return _update_securityRisk;
        case "userProfile":
            return _update_profile_user;
        case "sobject":
            return _update_sobject;
        case "objInfo":
            return _update_objInfo;
        case "license":
            return _update_license;
        case "orglimit":
            return _update_orglimit;
    }
}
