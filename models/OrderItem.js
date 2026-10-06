import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "order_id",
      references: {
        model: "orders",
        key: "id",
      },
    },

    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "product_id",
      references: {
        model: "products",
        key: "id",
      },
    },

    productName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: "product_name",
    },

    unitPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: "unit_price",
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    lineTotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: "line_total",
    },
  },
  {
    tableName: "order_items",
    timestamps: true,
    underscored: true,
  },
);

export default OrderItem;
