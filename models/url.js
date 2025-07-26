const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
    {
        shortId:{
            type: String,
            required: true,
            unique: true
        },
        redirectURl:{
            type: String,
            required: true,
            // unique: true
        },
        visitHistory:[ {timeStamp: { type: Number, }} ],
        createdBy:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
        },
    },
    {timestamps: true}
);


urlSchema.index({ redirectURl: 1, createdBy: 1 }, { unique: true });

const URL = mongoose.model("url", urlSchema);

module.exports = URL;