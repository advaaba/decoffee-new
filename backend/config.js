require('dotenv').config();

module.exports = {
    mongoURI: `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB}?${process.env.MONGO_OPTIONS}`,
    jwtSecret: process.env.JWT_SECRET,
    port: process.env.PORT || 5000
};
