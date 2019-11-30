module.exports = {  
    saveToDataBase: saveToDataBase,
    getObjectsInfoFromDB: getObjectsInfoFromDB
}

const { Pool } = require('pg')

const clientConfig = {
    user: 'postgres',
    host: 'localhost',
    database: 'Beaver',
    password: 'P@ssw0rd1',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000
}
const pool = new Pool(clientConfig)

async function saveToDataBase(query, result){
    pool.connect((err, client, done) => {
        if (err) throw err
        client.query(query,[result[0],result[1]], (err, res) => {
          done()
          if (err) {
            console.log(err.stack)
          } else {
            //console.log(res.rows[0])
            console.log("saved Data")
          }
        })
    })
}

async function getObjectsInfoFromDB(orgid) {
    const query = {name: 'fetch-data', text: 'SELECT objectinfo FROM objects WHERE orgid = $1', values: [orgid]}
       
    var result = await pool.connect().then(async client => {
        return await client.query(query)
      .then(res => {
        client.release()
        console.log(res.rows[0])
      })
      .catch(e => {
        client.release()
        console.log(err.stack)
      })
    return result
  })
}