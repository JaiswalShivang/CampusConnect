const mongoose = require("mongoose")
require("dotenv").config()

const dbconnect = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL)
    .then(()=>console.log("Database connected"))
    .catch(()=>console.log("Database connection error"))
  } catch (error) {
    console.log(error.message)
    process.exit(1)
  }
}

module.exports = dbconnect