var jsonString1 = '{"Name":"ABC","Work":"Programmer","State":"123"}';
var jsonString2 = '{"Name":"XYZ","Work":"Engineer","State":"456"}';

var jsonObject1 = JSON.parse(jsonString1);
var jsonObject2 = JSON.parse(jsonString2);

var keys = Object.keys(jsonObject1);
for (var i = 0; i < keys.length; i++) {
  var key = keys[i];
  if (jsonObject1[key] != jsonObject2[key]) {
    console.log(key + " value changed from '" + jsonObject1[key] + "' to '" + jsonObject2[key] + "'");
  }
}