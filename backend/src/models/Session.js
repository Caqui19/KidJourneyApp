const { DataTypes } = require('sequelize');

const sequelize = require('../config/database');

const Session = sequelize.define('Session', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },

    refreshTokenHash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
    },

    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
    },

    revokedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'Sessions',
    indexes: [
        { fields: ['userId'] },
        { fields: ['expiresAt'] },
    ],
});

module.exports = Session;
