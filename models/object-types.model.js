mongoose = require("mongoose");

var InteractiveObjectTypeSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    typeName: { type: String, required: "This field is required." },
    questionOrExplanation: {
      type: String,
      enum: ["Q", "X"],
    },
    labels: [{type: Object}],
    templateUrl: { type: String },
    templateJson: { type: Object }
  },
  {
    collection: "questionTypes",
    versionKey: false,
  }
);

InteractiveObjectTypeSchema
  .virtual("id")
  .get(function () {
    return this._id.toString();
  })
  .set(function (x) {
    this._id = x;
  });


module.exports = {
  InteractiveObjectTypeSchema: mongoose.model("InteractiveObjectTypeSchema", InteractiveObjectTypeSchema),
};
