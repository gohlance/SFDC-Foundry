var jsonString1 = '{"Name":"ABC","Work":"Programmer","State":"123"}';
var jsonString2 = '{"Name":"XYZ","Work":"Engineer","State":"456"}';

var jsonObject1 = JSON.parse(jsonString1);
var jsonObject2 = JSON.parse(jsonString2);
/**
var keys = Object.keys(jsonObject1);
for (var i = 0; i < keys.length; i++) {
  var key = keys[i];
  if (jsonObject1[key] != jsonObject2[key]) {
    console.log(key + " value changed from '" + jsonObject1[key] + "' to '" + jsonObject2[key] + "'");
  }
}
*/
var jsonDiff = require('json-diff');
var result = jsonDiff.diff(jsonObject1,jsonObject2);
console.log(result);
//result.Name ; result.Work

function compareChanges(orgId){
  let query = "SELECT * FROM orginformation WHERE orgid = $1 DESC id LIMIT 2";
  var records = await global.pool.query(query, [orgId]);
  var result_diff = "";
  if (records.rowCount > 0){
      for (var i = 0; i > Object.keys(records[0].name_data).length; i++){
        var json1 = JSON.parse(records[0][i]);
        var json2 = JSON.parse(records[1][i]);
        result_diff = result_diff + " " + jsonDiff(json1,json2);
      }
  }
  return result_diff;
}