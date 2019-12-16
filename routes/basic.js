const Pool = require('pg-pool')
const pool = new Pool({ user: 'postgres',
                        host: 'localhost',
                        database: 'Beaver',
                        password: 'P@ssw0rd1',
                        port: 5432,
                        max: 20, // set pool max size to 20
                        min: 4})

module.exports = ({
  router
}) => {
  router
    .get('home', '/', async (ctx) => {
      console.log("Gloabl: " + global.accesscode)
      console.log("Global :" + global.instanceUrl)

      
      if (!global.accesscode || !global.instanceUrl) {
        return ctx.render('index')
      }else{
        console.log(display_Homepage_Profiles())
        return ctx.render('welcome',{
          result_objects: await display_Homepage_Objects(), 
          result_profiles: await display_Homepage_Profiles(), 
          result_layouts: await display_Homepage_Layouts(),
          result_ApexComponents: await something(),
          result_apexTriggers: await something(),
          result_apexPages: await something(),
          result_recordTypes: await display_Homepage_RecordTypes()
        })
      }
    })
    .get('about', '/about', (ctx) => {
      ctx.body = "About US..."
    })
    .get('contact', '/contact', (ctx) => {
      ctx.body = "Contact US...."
    })
    .get('payment','/payment', (ctx) => {
      return ctx.render('payment')
    })
    
}

async function display_Homepage_Objects(){
  const result_object = await pool.query('SELECT objectinfo FROM objects WHERE orgid = $1',[global.orgId])
  if (result_object.rowCount > 0 ){
   return return_Object = result_object.rows[0]["objectinfo"]["allObject"].length
  }else{
   return return_Object = 0
  }
}
async function display_Homepage_Profiles(){
  const result_profile = await pool.query("SELECT profile FROM profiles WHERE orgid=$1",[global.orgId])

  if (result_profile.rows[0]["profile"].size > 0 ){
   return return_Object = result_profile.rows[0]["profile"].size
  }else{
    return return_Object = 0
  }
}
async function display_Homepage_Layouts(){
  const result_profile =  await pool.query("SELECT layout FROM layouts WHERE orgid=$1",[global.orgId]) 

  if (result_profile.rows[0]["layout"].size > 0 ){
    return return_Object = result_profile.rows[0]["layout"].size
  }else{
    return return_Object = 0
  }
}

async function display_Homepage_RecordTypes(){
  const result_profile =  await pool.query("SELECT recordtype FROM recordtypes WHERE orgid=$1",[global.orgId])
 
  if (result_profile.rows[0]["recordtype"].size > 0 ){
    return return_Object = result_profile.rows[0]["recordtype"].size
  }else{
    return return_Object = 0
  }
}

async function something(){
  return 0;
}