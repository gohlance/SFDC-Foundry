const fs = require("fs");
const path = require("path");
const puppeteer = require('puppeteer');
const handlebars = require("handlebars");

module.exports = {
    createPDF,
    assembleData
}

const data = {
	title: "A new Brazilian School",
	date: "05/12/2018",
	name: "Rodolfo Luis Marcos",
    age: 28,
    oen: 10,
	birthdate: "12/07/1990",
	course: "Computer Science",
    obs: "Graduated in 2014 by Federal University of Lavras, work with Full-Stack development and E-commerce.",
    items: ["A","B","C"],
    org: "Name of Org",
    objects: 1,
    profiles: 2,
    layout: 3,
    recordtype: 4,
    application: 5,
    risk: "high",
    ApexPage: 20,
    ApexTrigger: 21,
    ApexComponents: 22,
    licenses: [{Name:"A",UsedLicenses:"1", TotalLicense:"2"},{Name:"B",UsedLicenses:"11", TotalLicense:"12"}]
}

async function createPDF(data){
    var templateHtml = fs.readFileSync(path.join(process.cwd(), 'printtemplate.html'), 'utf8');
  	var template = handlebars.compile(templateHtml);
	var html = template(data);
  
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
		headless: true
	});

	var page = await browser.newPage();
      
    await page.setContent(html,{ waitUntil: ['domcontentloaded', 'load', "networkidle0"] });
    await page.emulateMediaType("screen");
    var result_pdf =  await page.pdf({ path: 'pdfPath.pdf',
    format: 'A4',
    printBackground: true,
    waitUntil: 'networkidle0',
    margin: {
      top: '20px',
      bottom: '20px',
      right: '20px',
      left: '20px' }});
      
    return result_pdf;
    /**

    await page.setContent(html,{ waitUntil: ['domcontentloaded', 'load', "networkidle0"] }).then(function (response) {
        //    page.emulateMedia('screen')
        
            page.pdf({ path: 'pdfPath.pdf',
                format: 'A4',
                printBackground: true,
                waitUntil: 'networkidle0',
                margin: {
                  top: '20px',
                  bottom: '20px',
                  right: '20px',
                  left: '20px' }})
              .then(function (res) {
                var pdf = page.pdf;
                browser.close();
                return pdf;
              }).catch(function (e) {
                browser.close();
              })
    })
     */
	//await page.pdf(options);
	//await browser.close();
}

async function assembleData(parameter, orgid){
    const _ = require('lodash');
    var result = {};
    if (_.isUndefined(parameter["Objects"]) != true){
        const d_obj = await global.pool.query("SELECT elem as records FROM orginformation o, lateral jsonb_array_elements(sobjectdescribe-> 'allObject') elem where elem->>'Objectname' = ANY($1) and orgid = $2 ORDER BY createdDate DESC ",[parameter["Objects"], orgid]);
        //console.log(JSON.parse(d_obj.rows));
        result.Objects = d_obj.rows;
        //d_obj.rows[0]["records"];
        //d_obj.rows[1]["records"];
    }
    if (_.isUndefined(parameter["Profiles"]) != true){
        const d_Profiles =  await global.pool.query("SELECT elem as records FROM orginformation o, lateral jsonb_array_elements(profile-> 'records') elem where elem->>'Name' = ANY($1) and orgid = $2 ORDER BY createdDate DESC ",[parameter["Objects"], orgid]);
        result.profile = d_Profiles.rows;
    }
    if (_.isUndefined(parameter["Trigger"]) != true){
        const d_Trigger = await global.pool.query("SELECT elem as records FROM orginformation o, lateral jsonb_array_elements(apextrigger -> 'records') elem where elem->>'Name' = ANY($1) and orgid = $2 ORDER BY createdDate DESC ",[parameter["ApexTrigger"], orgid]);
        result.trigger  = d_Trigger.rows;
    }
    if (_.isUndefined(parameter["Class"])!= true){
        const d_ApexPage = await global.pool.query("SELECT elem as records FROM orginformation o, lateral jsonb_array_elements(apexpage -> 'records') elem where elem->>'Name' = ANY($1) and orgid = $2 ORDER BY createdDate DESC ",[parameter["Class"], orgid]);
        result.page =  d_ApexPage.rows;
    }
    if (_.isUndefined(parameter["Component"])!= true){
        const d_Component = await global.pool.query("SELECT elem as records FROM orginformation o, lateral jsonb_array_elements(apexcomponet -> 'records') elem where elem->>'Name' = ANY($1) and orgid = $2 ORDER BY createdDate DESC ",[parameter["Component"], orgid]);
        result.component = d_Component.rows;
    }
    if (_.isUndefined(parameter["Class"])!=true){
        const d_Class = await global.pool.query("SELECT elem as records FROM orginformation o, lateral jsonb_array_elements(apexclass -> 'records') elem where elem->>'Name' = ANY($1) and orgid = $2 ORDER BY createdDate DESC ",[parameter["Class"], orgid]);
        result.class = d_Class.rows;
    }
    if (_.isUndefined(parameter["Process"]) != true){
        
    }
    if (_.isUndefined(parameter["Option_relationshipDetails"]) == true){
       result.Option_relationshipDetails = false;
    }
    return result;
}
