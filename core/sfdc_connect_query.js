module.exports = {
    selectQuery
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