require("dotenv").config();
const express = require("express");
let router = express.Router();
let mongoose = require("mongoose");
let interactiveObjectSchema = require("../models/interactive-object.model").interactiveObjectSchema;
const fs = require("fs")
router.get("/objectLabelsMCQ", async (req, res) => {
    res.status(200).json(
        [
            { question: "text" },
            { optionText: "text" },
            { chosenFeedback: "text" },
            { notChosenFeedback: "text" },
            { tip: "text" },
            { correct: "text" },
        ]
    )
});


router.post("/saveObjectMCQ/:id", async (req, res) => {
    const id = req.params.id
    const { objectElements } = req.body
    const newObj = {}
    
    newObj.type = "MCQ"
    const parameters = { question: "", answers: [] }
    const h5pString = { question: "", answers: [] }
    for (let item of objectElements) {
        let key = Object.keys(item)[0]

        if (key === "question") {
            parameters.question = item[key]
            h5pString.question = `<p>${item[key]}</p>`
        } else if (key === "optionText") {
            parameters.answers.push({ text: item[key], correct: false, tipsAndFeedback: {} })
            h5pString.answers.push({ text: `<div>${item[key]}</div>\\n`, correct: false, tipsAndFeedback: {} })
        } else if (key === "chosenFeedback") {
            parameters.answers[parameters.answers.length - 1]["tipsAndFeedback"]["chosenFeedback"] = item[key]
            h5pString.answers[h5pString.answers.length - 1]["tipsAndFeedback"]["chosenFeedback"] = `<div>\\n<div>\\n<div>${item[key]}</div>\\n</div>\\n</div>\\n`
        } else if (key === "notChosenFeedback") {
            parameters.answers[parameters.answers.length - 1]["tipsAndFeedback"]["notChosenFeedback"] = item[key]
            h5pString.answers[h5pString.answers.length - 1]["tipsAndFeedback"]["notChosenFeedback"] = `<div>\\n<div>\\n<div>${item[key]}</div>\\n</div>\\n</div>\\n`
        } else if (key === "tip") {
            parameters.answers[parameters.answers.length - 1]["tipsAndFeedback"]["tip"] = item[key]
            h5pString.answers[h5pString.answers.length - 1]["tipsAndFeedback"]["tip"] = `<p>${item[key]}</p>\\n`
        } else if (key === "correct") {
            parameters.answers[parameters.answers.length - 1]["correct"] = item[key]
            h5pString.answers[h5pString.answers.length - 1]["correct"] = item[key]
            newObj.isAnswered = 'g'
        }
    }
    h5pString.answers = JSON.stringify(h5pString.answers).replace(/\\\\/g, "\\")

    newObj.parameters = parameters
    newObj.h5pString = h5pString
    interactiveObjectSchema.updateOne(
    { _id: id },
    {
      $set: newObj,
    },
    { new: false, runValidators: true, returnNewDocument: true, upsert: true },
    (err, doc) => {
      if (!err) {
        res.status(200).json(newObj);
      } else {
        res.status(500).json(err);
      }
    }
  );
});

module.exports = router;
