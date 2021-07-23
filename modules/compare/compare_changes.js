const _ = require('lodash');
async function compareObjectInformation(orgId){
  let query = "SELECT objectinformation FROM orginformation WHERE orgid = $1 LIMIT 2";
  var records = await global.pool.query(query, [orgId]);
  var result_diff = "";

  if (records.rowCount > 0){
    for (var i=0; i < Object.keys(records.rows[0]).length; i++){
        var keyValue = Object.keys(records.rows[0])[i];
        var diff = require('deep-diff').diff;
        var records_previous = records.rows[0][keyValue];
        var records_new = records.rows[1][keyValue];
        for (var i=0; i < records_previous.length; i ++){
          let r =  _.find(records_new, records_previous[i]);
          if (_.isEmpty(r)){
            console.log("Found : " + records_previous[i]);
          }
         }
    }
  }
}

async function compareObjectMeta(orgId){
  let query = "SELECT sobjectdescribe FROM orginformation WHERE orgid = $1 LIMIT 2";
  var records = await global.pool.query(query, [orgId]);
  var result_diff = "";
  
  if (records.rowCount > 0){
    for (var i=0; i < Object.keys(records.rows[0]).length; i++){
        var keyValue = Object.keys(records.rows[0])[i];
        var diff = require('deep-diff').diff;
        var records_previous = records.rows[0][keyValue]['allObject'];
        var records_new = records.rows[1][keyValue]['allObject'];
       //TODO : need to go down to the totalfields to compare
       if (records_new[i]['totalfields'] != records_previous[i]['totalfields']){
          for (var i = 0;  i < _.max([records_new[i]['totalfields'], records_previous[i]['totalfields']]).length; i++){
            let r = _.find(records_new, records_previous[i]);
            if (_.isEmpty(r)){
              console.log("Found : " +  records_previous[i]);
            }
          }
       }

        for (var i=0; i < records_previous.length; i ++){
          let r =  _.find(records_new, records_previous[i]);
          if (_.isEmpty(r)){
            console.log("Found : " + records_previous[i]);
          }
         }
        
    }
  }
}

async function compareSecurityRisk(orgId){
  let query = "SELECT orgsecurityrisk FROM orginformation WHERE orgid = $1 LIMIT 2";
  var records = await global.pool.query(query, [orgId]);
  var result_diff = "";
  
  if (records.rowCount > 0){
    for (var i=0; i < Object.keys(records.rows[0]).length; i++){
        var keyValue = Object.keys(records.rows[0])[i];
        var records_previous = records.rows[0][keyValue]['records'];
        var records_new = records.rows[1][keyValue]['records'];

        for (var i=0; i < records_previous.length; i ++){
         let r =  _.find(records_new, records_previous[i]);
         if (_.isEmpty(r)){
           console.log("Found : " + records_previous[i]);
         }
        }

        //let  result = _.difference(records_previous, records_new);
        //console.log(result);      
    }
  }
}
async function compareChanges(orgId) {
  try {
    compareObjectMeta(orgId);
    //compareObjectInformation(orgId);
    //compareSecurityRisk(orgId);
  } catch (error) {
    console.log(error);
  }
}


module.exports = {
  compareChanges
}