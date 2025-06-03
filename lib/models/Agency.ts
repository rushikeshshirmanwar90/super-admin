import { model, models, Schema, Types } from "mongoose";

// Reference the Client model using ObjectId
const AgencySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: false,
    },

    address: {
      type: String,
      required: true,
    },

    logo: {
      type: String,
      required: true,
    },

    clients: [
      {
        type: Types.ObjectId,
        ref: "Client",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Agency = models.Agency || model("Agency", AgencySchema);
