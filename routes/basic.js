const sfdcmethods = require('../sfdc-api')
const _ = require('lodash')
const passport = require('koa-passport');
const bcrypt = require('bcrypt');
const { session } = require('koa-passport');
module.exports = ({
  router
}) => {
  router
    .get('home', '/', async (ctx) => {
      if (ctx.isAuthenticated()){
        ctx.redirect('/getstarted');
      }else{
        return ctx.render('/p/login_index',  {layout: false});
      }
    })
    .get('welcome', '/welcome', async (ctx) => {
      //console.log("QueryString : " + ctx.request.query["org"])
      //console.log("Authenticated : " + ctx.isAuthenticated())
      if (ctx.isAuthenticated()){
        if (!ctx.session.orgId){
          ctx.session.orgId = ctx.request.query["org"]
        }
        console.log("Debug Mode : " + ctx.session.accesscode + " / " + ctx.session.instanceUrl + " / " + ctx.session.orgId);
        const processbuilder = require('../modules/processbuilder/processbuilder-api');

        return ctx.render('welcome', {
          result_objects: _.defaultTo(await sfdcmethods.display_Homepage_Objects(ctx.session), 0),
          result_profiles: _.defaultTo(await sfdcmethods.display_Homepage_Profiles(ctx.session), 0),
          result_layouts: _.defaultTo(await sfdcmethods.display_Homepage_Layouts(ctx.session), 0),
          result_ApexComponents: _.defaultTo(await sfdcmethods.display_Homepage_ApexComponents(ctx.session), 0),
          result_apexTriggers: _.defaultTo(await sfdcmethods.display_Homepage_ApexTrigger(ctx.session), 0),
          result_apexPages: _.defaultTo(await sfdcmethods.display_Homepage_ApexPages(ctx.session), 0),
          result_recordTypes: _.defaultTo(await sfdcmethods.display_Homepage_RecordTypes(ctx.session), 0),
          result_orgInformation: _.defaultTo(await sfdcmethods.getMoreOrgDetails(ctx.session), 0),
          result_userLicense: _.defaultTo(await sfdcmethods.getUserLicenseDetails(ctx.session), 0),
          result_securityRisk: _.defaultTo(await sfdcmethods.getSecurityRisk("HOME", ctx.session), [0, 0]),
          result_customapp: _.defaultTo(await sfdcmethods.getCustomApps("HOME", ctx.session), [0, 0, 0]),
          result_processBuilder: _.defaultTo(await processbuilder.all_process(ctx.session.orgId), 0),
          session: ctx.session,
          orgname: ctx.request.query["n"]
        })

      }else{
        return ctx.render('/p/login_index')
      }
    })
    .get('index', '/index', (ctx) => {
      return ctx.render('/p/login_index')
    })
    .get('about', '/about', (ctx) => {
      ctx.body = "About US..."
    })
    .get('contact', '/contact', (ctx) => {
      return ctx.render('contactus')
    })
    .get('payment', '/payment', (ctx) => {
      return ctx.render('payment')
    })
    .post('register', '/auth/register', async (ctx) => {
      let hash = bcrypt.hashSync(ctx.request.body.password, 10);
      const user = await global.pool.query("INSERT INTO Users (user_name, user_email, user_password) VALUES ($1, $2, $3)", [ctx.request.body.username, ctx.request.body.useremail, hash])
      return passport.authenticate('local', (err, user, info, status) => {
        if (user) {
          ctx.login(user);
          ctx.redirect('/getstarted');
        } else {
          ctx.status = 400;
          ctx.body = {
            status: 'error'
          };
        }
      })(ctx);
    })
    .post('login','/auth/login', async (ctx) => {
      return passport.authenticate('local', (err, user, info, status) => {
        try {
          if (user) {
            ctx.login(user);
            ctx.redirect('/getstarted');
          } 
        } catch (error) {
          ctx.status = 400;
          this.throw(error);
        }
      })(ctx);
    })
    .get('logout','/logout',(ctx) => {
      if (ctx.isAuthenticated()){
        ctx.logout()
        ctx.redirect('/p/login_index')
      } else {
        ctx.body = { success: false }
        ctx.throw(401)
      }
    })
    .get('getStarted','/getstarted',async (ctx) => {
      if (ctx.isAuthenticated()){
        //Call a method to get all the orgs with the userid
        return ctx.render('getstarted',{
          allOrgs: _.defaultTo(await sfdcmethods.getAllOrgsByUserId(ctx.session.passport.user.id),0),
          session: ctx.session
        })
      }else{
        ctx.redirect('/p/login_index');
      }
    })
    
    //DocGen Section
    .get('docgen','/docgen', async (ctx) => {
      try {
        if (ctx.isAuthenticated()){
          const orgId = JSON.parse(ctx.session.doc_orgId).oid[0];
          const result_obj = await global.pool.query('SELECT sobjectdescribe FROM orginformation WHERE orgid = $1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY', [orgId])
          const result_profile = await global.pool.query("SELECT profile_user FROM orginformation where orgid = $1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY",[orgId])
          const result_apexPage = await global.pool.query("SELECT apexpage FROM orginformation WHERE orgid=$1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY", [orgId])
          const result_apexClass = await global.pool.query("SELECT apexclass FROM orginformation WHERE orgid=$1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY", [orgId])
          const result_apexComponent = await global.pool.query("SELECT apexcomponent FROM orginformation WHERE orgid = $1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY", [orgId])
          const result_apexTriggers = await global.pool.query("SELECT apextrigger FROM orginformation WHERE orgid = $1 ORDER BY createdDate DESC FETCH FIRST ROW ONLY", [orgId])
          //TODO: This section need to test
          const processbuilder = require('../modules/processbuilder/processbuilder-api')
          const result_workflow = await processbuilder.all_process(orgId); 
          //const result_validation = ;
          return ctx.render('/docgen',{
            docgen_Objects : result_obj.rows[0]["sobjectdescribe"]["allObject"],
            docgen_Profiles: result_profile.rows[0]["profile_user"]["undefined"],
            docgen_apexPage: result_apexPage.rows[0]["apexpage"].records,
            docgen_apexClass: result_apexClass.rows[0]["apexclass"].records,
            docgen_apexComponent: result_apexComponent.rows[0]["apexcomponent"].records,
            docgen_apexTrigger: result_apexTriggers.rows[0]["apextrigger"].records,
            docgen_process: result_workflow
          });
        }
      } catch (error) {
        console.log(error);
      }
    })
    //Save the data before wizard, selected Org for the documentation generation.
    .post('saveSelectedOrgId','/saveSelectedOrgId', async (ctx) =>{
      const data = JSON.stringify(ctx.request.body);
      ctx.session.doc_orgId = data;
      ctx.status = 200;
    })
    //Save the data from wizard to session.
    .post('saveSession','/saveSession', async (ctx) => {
      const data = JSON.stringify(ctx.request.body);
      ctx.session.docgen = data;
      ctx.status = 200;
    })

    .get('previewDoc','/previewDoc', async (ctx)=>{
      var data = JSON.parse(ctx.session.docgen);
      if (_.isUndefined(data) != true){
          return ctx.render('template',{
            result_objects : data["Objects"],
            result_profiles: data["Profiles"],
            result_layouts: "",
            result_recordTypes: "",
            result_customapp: "",
            result_securityRisk: "",
            result_apexPages:"",
            result_apexTriggers: data["Trigger"],
            result_ApexComponents:"",
          }); 
      }
    })

    .get('saveAsPDF','/saveAsPDF', async (ctx)=>{
      const saveAsPDF = require('../modules/pdf/genPDF');
      //TODO: Need to see how this docGen_data structure looks like and map to template
      const docGen_data = await saveAsPDF.assembleData(JSON.parse(ctx.session.docgen), JSON.parse(ctx.session.doc_orgId).oid[0]);
      var pdf = await saveAsPDF.createPDF(docGen_data);

      ctx.response.set({'Content-Type': 'application/pdf', 'Content-Length': pdf.length});
      ctx.set('Content-disposition', 'attachment;filename=docname.pdf');
      ctx.body = pdf;
      //ctx.response.attachment(pdf);
    })

    //for modal dialog selecting the Org, used on layout.html - Doc Gen
    .get('getAllOrgsAPI','/getAllOrgsAPI', async (ctx)=>{
      const allOrg = _.defaultTo(await sfdcmethods.getAllOrgsByUserId(ctx.session.passport.user.id),0);
      ctx.status = 200;
      ctx.body = {orgs: allOrg};
    })

    //DocGen Section End

    //this is for layout.html, displaying username in layout
    .get('getUsername','/getUsername', async (ctx)=>{
      const username = ctx.state.user.userName;   
      ctx.status =200;
      ctx.body = { success: true, name:username};  
    })
}