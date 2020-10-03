const sfdcmethods = require('../sfdc-api')
const _ = require('lodash')
const genPDF = require('../genPDF');

module.exports = ({
    router
  }) => {
    router
    .get('generatePDF','/generatePDF', async(ctx)=>{
        if (ctx.isAuthenticated()){
            if (!ctx.session.orgId){
              ctx.session.orgId = ctx.request.query["org"]
            }
            
            const data = {result_objects: _.defaultTo(await sfdcmethods.display_Homepage_Objects(ctx.session), 0),
                result_profiles: _.defaultTo(await sfdcmethods.display_Homepage_Profiles(ctx.session), 0),
                result_layouts: _.defaultTo(await sfdcmethods.display_Homepage_Layouts(ctx.session), 0),
                result_ApexComponents: _.defaultTo(await sfdcmethods.display_Homepage_ApexComponents(ctx.session), 0),
                result_apexTriggers: _.defaultTo(await sfdcmethods.display_Homepage_ApexTrigger(ctx.session), 0),
                result_apexPages: _.defaultTo(await sfdcmethods.display_Homepage_ApexPages(ctx.session), 0),
                result_recordTypes: _.defaultTo(await sfdcmethods.display_Homepage_RecordTypes(ctx.session), 0),
                result_orgInformation: _.defaultTo(await sfdcmethods.getMoreOrgDetails(ctx.session), 0),
                result_userLicense: _.defaultTo(await sfdcmethods.getUserLicenseDetails(ctx.session), 0),
                result_securityRisk: _.defaultTo(await sfdcmethods.getSecurityRisk("HOME", ctx.session), [0, 0]),
                result_customapp: _.defaultTo(await sfdcmethods.getCustomApps("HOME", ctx.session), [0, 0, 0]),}
          
            genPDF.createPDF(data);
    
          }else{
            
          }
    })
  }