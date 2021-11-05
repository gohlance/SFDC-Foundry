const _ = require('lodash')

module.exports = {demystify_processbuilder, draw, all_process, getProcessByObject}

async function all_process(orgid){
    //const result =  await global.pool.query("SELECT processflow_metadata ->0->0->> 'DefinitionId' as DefinitionId, processflow_metadata ->0->0->> 'FullName' as FullName FROM orginformation o where orgid=$1 order by createddate  desc", [session.orgId]);
    //return result.rows;
    const result = await global.pool.query("SELECT processflow FROM orginformation WHERE orgid=$1 ORDER BY createdDate DESC limit 1", [orgid]);
    console.log(result);
    return result.rows[0]["processflow"].records
}

async function getProcessByObject(objectName){
    const result = await global.pool.query("SELECT processflow_metadata ->0->0->> 'DefinitionId' as DefinitionId, processflow_metadata ->0->0->'FullName' as fullname FROM orginformation o where processflow_metadata ->0->0->'Metadata'->'processMetadataValues'->0->'value'->>'stringValue' = $1 and orgid = $2 order by createddate  desc fetch first row ONLY",[objectName, global.orgId])
    return result.rows;
}

async function demystify_processbuilder(definitionId, orgId){
    //const result = await global.pool.query("SELECT elem FROM orginformation o, jsonb_array_elements(processflow_metadata) elem where elem -> 0 ->> 'DefinitionId' = $1 and orgid = $2",[definitionId, orgId])
    const result = await global.pool.query("SELECT processflow_metadata->0->0 as Meta FROM orginformation o where processflow_metadata ->0->0->> 'DefinitionId' = $1 and orgid = $2", [definitionId, orgId]);

    let _meta = result.rows[0].meta.Metadata;
    let actions = _meta.actionCalls;
    let decision_array = _meta.decisions;

    let last_counter_forChart = 2;
    var chart = "graph TD\n "+ (last_counter_forChart-1) + "["+ result.rows[0].meta.FullName + "] -->";
    
    decision_array.forEach(item => {
        //last_counter_forChart = last_counter_forChart + 1;
        let conditionLabel = item.rules[0].label;
        let conditionName = item.rules[0].name;

        chart = chart + " " + last_counter_forChart + "{" + conditionLabel + "}\n";
        let _find = []

        //TODO: Loop the actions
        actions.forEach(ac => {
            if (ac.name.includes(conditionName)){
                _find.push(ac);
            }
        })

        var nextStep = last_counter_forChart+1;
        if (_find.length > 1){
            var PreviousStep;
            for (var i = 0; i < _find.length; i ++ ){
                if (_.isUndefined(PreviousStep)){
                    PreviousStep = nextStep + "." + i;
                    chart = chart + " " + last_counter_forChart +" --> |True| " +  PreviousStep +"[" + _find[i].label + "] \n";
                }else{
                    chart = chart + " " + PreviousStep +" --> " +  nextStep + "."+ i +"[" + _find[i].label + "] \n";
                    PreviousStep = nextStep + "." + i;
                }
                
            }
        }else{
            chart = chart + " " + last_counter_forChart +" --> |True| " +  nextStep +"[" + _find[0].label + "] \n";
        }
        
        
        chart = chart + " " + last_counter_forChart + " --> |FALSE|";
        last_counter_forChart = (nextStep +1)
    
    })

    chart = chart + " " + last_counter_forChart + "[END]";

    return chart;



    //-- Old Codes --//
    let variable_array = getVariables(_meta.variables)
    //Get Decision
    

    let startingElement = _meta.startElementReference

    console.log("I am done")
    // this is going to have an issue, how do i split the value
    let recordsresult = []
    ;(await decision_array).forEach(e => {
        if(meta.recordCreates.length > 0){
            recordsresult= checkCRUD(meta.recordCreates, e)
        }else if (meta.recordDeletes.length > 0){
            recordsresult=  checkCRUD(meta.recordDeletes, e)
        }else if (meta.recordLookups.length > 0){
            recordsresult=  checkCRUD(meta.recordLookups,e)
        }else if (meta.recordUpdates.length > 0){
            recordsresult = checkCRUD(meta.recordUpdates, e)
        }
    })

    console.log(recordsresult)
    console.log("This process is about " + meta.processMetadataValues[0].value["stringValue"] + " condition to start : " + meta.processMetadataValues[3].value["stringValue"])
    console.log("There are " + decision_array.length + " decision in the " + meta.processType)
    console.log("The Starting node is " + startingElement)

}





async function getVariables(meta_variables){
    let variable_array = []
    if (meta_variables.length > 0){
        meta_variables.forEach(e => {
            variable_array.push({"name": e.name, "objectType": e.objectType, "isInput": e.isInput, "isOutput": e.isOutput})
        })
    }
    return variable_array
}

//This is multi function method, that work with recordCreates, recordDeletes, recordLookups, recordUpdatesß
async function checkCRUD(meta_record, rule_name){
    let record_result = []
    meta_record.forEach(e=>{
        if (e.name.startsWith(rule_name)){
            record_result.push(e)
        }
    })
    return record_result
}

function draw(){
    
}