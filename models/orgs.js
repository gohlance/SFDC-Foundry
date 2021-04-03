const { Sequelize, DataTypes, Model } = require('sequelize');
//const sequelize = new Sequelize('postgres://postgres:P@ssw0rd1@localhost:5432/public') // Example for postgres
const sequelize = new Sequelize('postgres://bxhbybpvxuyesk:6ec25f57a5d561b4a6eb6e8cd93b8de3f1dbae20fed0dc55b484637bd7ef1489@ec2-54-174-221-35.compute-1.amazonaws.com:5432/detjik593i3enh');
class Orgs extends Model {}
var _orgs = Users.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orgid: {
        type: DataTypes.TEXT
    },
    orgType: {
        type: DataTypes.TEXT
    },
    user_id: {
        type: DataTypes.INTEGER
    }
}, {
    uniqueKeys: {
        actions_unique: {
            fields: ['user_id', 'orgid']
        }
    },
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'orgs' // We need to choose the model name
});

_orgs.sync({alter:true});
module.exports = _orgs;
