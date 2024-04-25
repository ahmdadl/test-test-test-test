require("dotenv").config();
const express = require("express");
let router = express.Router();
let mongoose = require("mongoose");
let InteractiveObjectTypeSchema =
  require("../models/object-types.model").InteractiveObjectTypeSchema;

router.get("/interactive-object-types", async (req, res) => {
  const typeNames = await InteractiveObjectTypeSchema.find(
    {},
    { typeName: 1, labels: 1, _id: 1 }
  );
  res.status(200).json(typeNames);
});

router.post("/interactive-object-types", async (req, res) => {
  let newObj = {};
  const existingObjectType = await InteractiveObjectTypeSchema.find({
    typeName: req.body.typeName,
  });
  if (existingObjectType.length > 0) newObj = existingObjectType[0];
  else {
    newObj = new InteractiveObjectTypeSchema({ _id: false });
    newObj.id = new mongoose.Types.ObjectId();
  }
  for (let key in req.body) {
    if (Object.hasOwnProperty.bind(req.body)(key)) {
      if (
        ["labels", "templateJson"].includes(key) &&
        typeof req.body[key] === "string"
      )
        newObj[key] = JSON.parse(req.body[key]);
      else newObj[key] = req.body[key];
    }
  }
  if (existingObjectType.length > 0) {
    InteractiveObjectTypeSchema.updateOne(
      { _id: newObj._id },
      {
        $set: newObj,
      },
      {
        new: false,
        runValidators: true,
        returnNewDocument: true,
        upsert: true,
      },
      (err, doc) => {
        if (!err) {
          res.status(200).json(newObj);
        } else {
          res.status(500).json(err);
        }
      }
    );
  } else
    newObj.save((err, doc) => {
      if (!err) {
        res.status(200).json(newObj);
      } else {
        console.log(err);
        res.status(406).json(`Not Acceptable: ${err}`);
      }
    });
});

router.delete("/interactive-object-types/:id", async (req, res) => {
  InteractiveObjectTypeSchema.findByIdAndRemove(req.params.id)
    .then((doc) => {
      res.status(200).json("Type deleted successfully.");
    })
    .catch((err) => {
      res.status(500).json(`Can't delete type: ${err}`);
    });
});
module.exports = router;
