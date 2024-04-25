const mongoose = require("mongoose")
require("dotenv").config()

mongoose.connect(
  process.env.MONGOD_CONNECT_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (error) => {
    if (!error) console.log("mongoose connection success")
    else console.log("Error with mongo connect: " + error)
  }
)
mongoose.set("useFindAndModify", false)


require("./models/interactive-quiz.model")
require("./models/interactive-object.model")
