const mongoose = require("mongoose");

const connectDatabase = () => {
    mongoose.connect(process.env.DB_URL)
        .then((data) => {
            console.log(`MongoDB connected with server: ${data.connection.host}`);
        })
        .catch((error) => {
            console.log(`Database connection error: ${error.message}`);
            process.exit(1);
        });
};

module.exports = connectDatabase;