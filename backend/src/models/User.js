const { DataTypes } = require('sequelize');

const sequelize = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },

    email: {
        type: DataTypes.STRING(254),
        allowNull: false,
        unique: true,
    },

    senha: {
        type: DataTypes.STRING(60),
        allowNull: false,
    },

    aceite_termos: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
}, {
    tableName: 'Users',
});

module.exports = User;
