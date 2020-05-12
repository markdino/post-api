require("dotenv").config();
const mongoose = require("mongoose");

module.exports.connect = () => {
    mongoose.connect(process.env.DB_PATH, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}