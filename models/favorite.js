const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const favoriteSchema = new Schema(
    {
        user: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        campsites: [
            {
                type: mongoose.Types.ObjectId,
                ref: "Campsite",
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Favorite = mongoose.model("Favorite", favoriteSchema);

module.exports = Favorite;
