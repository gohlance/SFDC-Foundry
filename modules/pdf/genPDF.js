const fs = require("fs");
const path = require("path");
const puppeteer = require('puppeteer');
const handlebars = require("handlebars");

module.exports = {
    createPDF
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
    //console.log(process.cwd());
    var templateHtml = fs.readFileSync(path.join(process.cwd(), 'template.html'), 'utf8');
    //console.log(templateHtml);
	var template = handlebars.compile(templateHtml);
	var html = template(data);
    console.log(html);
	var milis = new Date();
	milis = milis.getTime();

	var pdfPath = path.join('pdf', `${data.name}-${milis}.pdf`);

	var options = {
		width: '1230px',
		headerTemplate: "<p></p>",
		footerTemplate: "<p></p>",
		displayHeaderFooter: false,
		margin: {
			top: "10px",
			bottom: "30px"
		},
		printBackground: true,
		path: pdfPath
	}

	const browser = await puppeteer.launch({
		args: ['--no-sandbox'],
		headless: true
	});

	var page = await browser.newPage();
    
    //BUG: this will be a issue with local browser, need to load page with parameter
	//await page.goto(`data:text/html;charset=UTF-8,${html}`, {
	//	waitUntil: 'networkidle0'
    //});
    
    await page.setContent(html,{ waitUntil: ['domcontentloaded', 'load', "networkidle0"] }).then(function (response) {
        //    page.emulateMedia('screen')
            page.pdf({ path: pdfPath,
                format: 'A4',
                printBackground: true,
                waitUntil: 'networkidle0',
                margin: {
                  top: '20px',
                  bottom: '20px',
                  right: '20px',
                  left: '20px' }})
              .then(function (res) {
                
                browser.close();
              }).catch(function (e) {
                browser.close();
              })
          })

	//await page.pdf(options);
	//await browser.close();
}

createPDF(data);
