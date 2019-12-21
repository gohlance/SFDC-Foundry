const jsforce = require('jsforce')

var oauth2 = new jsforce.OAuth2({
    // you can change loginUrl to connect to sandbox or prerelease env.
    // loginUrl : 'https://test.salesforce.com',
    clientId: '3MVG9i1HRpGLXp.qKwbWJHwmeMEDkgggAcpbAf1Y1O7YvezHR_7aOv00w2a_Vz3gst8vk23v4e3qfLRbkKsFi',
    clientSecret: '5675F7043344E39EC5A402927491DA9040F7C857C7A6F0B4D0AF8D3AE69BA8DF',
    redirectUri: 'https://testingauth123.herokuapp.com/auth3/login/return'
});

//*** Only for Development */
global.instanceUrl = "https://singaporeexchangelimited.my.salesforce.com"
global.accesscode = "00D46000001Uq6O!AQoAQG7bpZTRbixifkZK08vatA53MZTUDvSUoNHh929v6KB6z7ATagIY1WvJSOamBnfvAV0CpF6q0PbQSE0yST8lCVpM1cEI"
global.orgId = "567"

var conn = new jsforce.Connection({
    oauth2: oauth2,
    instanceUrl: global.instanceUrl,
    accessToken: global.accesscode
})



testing();


async function testing(){
   const somethinv = await global.pool.query("SELECT * FROM objects WHERE ID = 20")

   let somet = 1
   let else = 2
  }

