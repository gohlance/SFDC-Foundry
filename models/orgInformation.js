require('custom-env').env();
const { Sequelize, DataTypes, Model } = require('sequelize');
if (process.env.APP_ENV ==  "dev"){
    const sequelize = new Sequelize('postgres://postgres:P@ssw0rd1@localhost:5432/public') // Example for postgres
}else{
    const sequelize = new Sequelize('postgres://bxhbybpvxuyesk:6ec25f57a5d561b4a6eb6e8cd93b8de3f1dbae20fed0dc55b484637bd7ef1489@ec2-54-174-221-35.compute-1.amazonaws.com:5432/detjik593i3enh');
}

class OrgInformation extends Model {}
var _OrgInformation = OrgInformation.init({
  orgid: {
    type: DataTypes.STRING
  },
  metainformation:{
    type: DataTypes.JSONB
  },
  objectinformation:{
      type: DataTypes.JSONB
  },
  orgLicenseInformation:{
      type: DataTypes.JSONB
  },
  orgLimitsInformation:{
      type: DataTypes.JSONB
  },
  orgSecurityRisk: {
      type: DataTypes.JSONB
  },
  sobjectdescribe: {
      type: DataTypes.JSONB
  },
  apextrigger: {
      type: DataTypes.JSONB
  },
  apexpage: {
      type: DataTypes.JSONB
  },
  apexclass: {
      type: DataTypes.JSONB
  },
  apexcomponent: {
      type: DataTypes.JSONB
  },
  profile: {
      type: DataTypes.JSONB
  },
  profile_user: {
      type: DataTypes.JSONB
  },
  layout: {
      type: DataTypes.JSONB
  },
  profileslayout: {
      type: DataTypes.JSONB
  },
  customAppn:{
      type: DataTypes.JSONB
  },
  businessprocess: {
      type: DataTypes.JSONB
  },
  workflowrule: {
      type: DataTypes.JSONB
  },
  validationrule: {
      type: DataTypes.JSONB
  },
  recordType: {
      type: DataTypes.JSONB
  }
}, {
  // Other model options go here
  sequelize, // We need to pass the connection instance
  modelName: 'OrgInformation' // We need to choose the model name
});

//ScrapperLog.sync({alter:true});
module.exports = _OrgInformation;