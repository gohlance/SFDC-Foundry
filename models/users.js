require('custom-env').env();
const { Sequelize, DataTypes, Model } = require('sequelize');
if (process.env.APP_ENV ==  "dev"){
    const sequelize = new Sequelize('postgres://postgres:P@ssw0rd1@localhost:5432/public') // Example for postgres
}else{
    const sequelize = new Sequelize('postgres://bxhbybpvxuyesk:6ec25f57a5d561b4a6eb6e8cd93b8de3f1dbae20fed0dc55b484637bd7ef1489@ec2-54-174-221-35.compute-1.amazonaws.com:5432/detjik593i3enh');
}
class Users extends Model {}
var _users = Users.init({
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_name:{
        type: DataTypes.TEXT
    },
    user_email: {
        type: DataTypes.TEXT,
        unique: true
    },
    user_password: {
        type: DataTypes.TEXT
    }
}, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'user' // We need to choose the model name
});

_users.sync({alter:true});
module.exports = _users;