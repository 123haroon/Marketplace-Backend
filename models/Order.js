import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: "order_number",
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
      references: {
        model: "users",
        key: "id",
      },
    },

    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },

    deliveryCharges: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      field: "delivery_charges",
    },

    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },

    paymentMethod: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "COD",
      field: "payment_method",
    },

    paymentStatus: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "pending",
      field: "payment_status",
    },

    orderStatus: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "pending",
      field: "order_status",
    },

    shippingName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: "shipping_name",
    },

    shippingPhone: {
      type: DataTypes.STRING(30),
      allowNull: false,
      field: "shipping_phone",
    },

    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "shipping_address",
    },

    shippingCity: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "shipping_city",
    },
  },
  {
    tableName: "orders",
    timestamps: true,
    underscored: true,
  },
);

export default Order;
