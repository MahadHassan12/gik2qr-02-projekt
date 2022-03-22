module.exports = (sequelize, DataTypes) => {
    return sequelize.define("item", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                len: [2, 100]
            }
        },
        description: {
            type: DataTypes.STRING(1000),
            allowNull: false
        },
        price: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            validate: {
                min: 1.00
            }
        },
        imageUrl: {
            type: DataTypes.STRING(255),
            validate: {
                isUrl: true
            }
        },
    }, { underscored: true });
};