const sequelize = require('../config/database');

const User = require('./User');
const Session = require('./Session');

Session.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
});

User.hasMany(Session, {
    foreignKey: 'userId',
    as: 'sessions',
});

module.exports = {
    sequelize,
    User,
    Session,
};
