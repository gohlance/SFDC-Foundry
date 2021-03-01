const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize('postgres://postgres:P@ssw0rd1@localhost:5432/public') // Example for postgres

/**
 * id serial NOT NULL,
	orgid text NULL,
	metainformation jsonb NULL,
	objectinformation jsonb NULL,
	orgLicenseInformation jsonb NULL,
	orgLimitsInformation jsonb NULL,
	orgSecurityRisk jsonb NULL,
	sobjectdescribe jsonb NULL,
	apextrigger jsonb NULL,
	apexpage jsonb NULL,
	apexclass jsonb NULL,
	apexcomponent jsonb NULL,
	profile jsonb NULL,
	profile_user jsonb NULL,
	layout jsonb NULL,
	profileslayout jsonb NULL,
	customAppn jsonb NULL,
	businessprocess jsonb NULL,
	workflowrule jsonb NULL,
	validationrule jsonb NULL,
	recordtype jsonb NULL,
	createdDate timestamp not null default CURRENT_TIMESTAMP, 
	CONSTRAINT orginformation_pkey PRIMARY KEY (id)
 * 
 */

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