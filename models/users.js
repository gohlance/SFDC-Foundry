const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize('postgres://postgres:P@ssw0rd1@localhost:5432/public') // Example for postgres

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