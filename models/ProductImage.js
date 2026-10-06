import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ProductImage = sequelize.define(
  "ProductImage",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    publicId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "public_id",
    },

    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "product_id",
    },

    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "image_url",
    },

    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_primary",
    },

    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "sort_order",
      validate: {
        min: 0,
      },
    },
  },
  {
    tableName: "product_images",
    timestamps: true,
    underscored: true,
  },
);

export default ProductImage;
