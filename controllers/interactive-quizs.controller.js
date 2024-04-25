require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
let router = express.Router();
let mongoose = require("mongoose");
let interactiveQuizSchema =
  require("../models/interactive-quiz.model").interactiveQuizSchema;
let InteractiveObjectTypeSchema = require("../models/object-types.model").InteractiveObjectTypeSchema;
const fs = require("fs")
const path = require("path")
const request = require("request")
const dataArray = [];

/**
 *@swagger
 *
 *info:
 *  version: 2.0.0
 *  title: Interactive Object APIs .
 * schemes:
 *   - http
 * host: localhost:4000
 * basePath: /api
 *
 *paths:
 *  /interactive-objects:
 *    get:
 *      tags:
 *        - interactive-objects
 *      parameters:
 *        - name: page
 *          in: query
 *          example: 1
 *        - name: limit
 *          in: query
 *          example: 10
 *        - name: objectName
 *          in: query
 *          type: string
 *        - name: domainId
 *          in: query
 *          type: string
 *        - name: domainName
 *          in: query
 *          type: string
 *        - name: subDomainId
 *          in: query
 *          type: string
 *        - name: subDomainName
 *          in: query
 *          type: string
 *        - name: language
 *          in: query
 *          type: string
 *        - name: isAnswered
 *          in: query
 *          type: string
 *          enum:
 *            - r
 *            - y
 *            - g
 *        - name: type
 *          in: query
 *          type: string
 *        - name: objectOrExplanation
 *          in: query
 *          type: string
 *          enum:
 *            - Q
 *            - X
 *      responses:
 *        200:
 *          description: List of interactive-objects
 *          schema:
 *            type: array
 *            items:
 *              $ref: "#/definitions/GetObject"
 *
 *    post:
 *      tags:
 *        - interactive-objects
 *      description: Add new object.
 *      parameters:
 *        - name: object
 *          in: body
 *          required: true
 *          schema:
 *            $ref: "#/definitions/PostObject"
 *      responses:
 *        200:
 *          description: learning object created successfully.
 *        406:
 *          description: Not Acceptable.
 *
 *  /interactive-objects/{id}:
 *    get:
 *      tags:
 *        - interactive-objects
 *      description: Get object by ID.
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          type: string
 *      responses:
 *        200:
 *          description: Required object data.
 *          schema:
 *            $ref: "#/definitions/GetObject"
 *        404:
 *          description: Can't find object with the given ID
 *
 *    patch:
 *      tags:
 *        - interactive-objects
 *      description: update object.
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          type: string
 *        - name: object
 *          in: body
 *          required: true
 *          schema:
 *            $ref: "#/definitions/PostObject"
 *      responses:
 *        200:
 *          description: Object updated successfully.
 *          schema:
 *            $ref: "#/definitions/GetObject"
 *        404:
 *          description: Can't find object with the given ID.
 *
 *    delete:
 *      tags:
 *        - interactive-objects
 *      description: Delete object.
 *      parameters:
 *        - name: id
 *          in: path
 *          required: true
 *          type: string
 *      responses:
 *        200:
 *          description: Object deleted successfully.
 *        404:
 *          description: Can't find object with the given ID.
 *
 * definitions:
 *   GetObject:
 *     properties:
 *       _id:
 *         type: string
 *         example: 5df780cc50b2d42fd00dc872
 *       questionName:
 *         type: string
 *         example: What is ionic bond?
 *       language:
 *         type: string
 *         example: en
 *         enum:
 *           - en
 *           - ar
 *           - fr
 *           - it
 *           - es
 *           - de
 *       domainId:
 *         type: string
 *         example: 5df780cc50b2d42fd00dc872
 *       domainName:
 *         type: string
 *         example: Science
 *       subDomainId:
 *         type: string
 *         example: 5df780cc50b2d42fd00dc872
 *       subDomainName:
 *         type: string
 *         example: Ionic Bonds
 *       isAnswered:
 *         type: string
 *         enum:
 *           - r
 *           - y
 *           - g
 *       parameters:
 *         type: object
 *       type:
 *         type: string
 *         example: MCQ
 *       objectOrExplanation:
 *          type: string
 *          enum:
 *            - Q
 *            - X
 *       createdAt:
 *         type: string
 *         format: date
 *         example: 2023-12-10T10:21:28.729Z
 *       updatedAt:
 *         type: string
 *         format: date
 *         example: 2023-12-10T10:21:28.729Z
 *   PostObject:
 *     required:
 *       - questionName
 *       - language
 *     properties:
 *       questionName:
 *         type: string
 *         example: What is ionic bond?
 *       language:
 *         type: string
 *         example: en
 *         enum:
 *           - en
 *           - ar
 *           - fr
 *           - it
 *           - es
 *           - de
 *       domainId:
 *         type: string
 *         example: 5df780cc50b2d42fd00dc872
 *       domainName:
 *         type: string
 *         example: Science
 *       subDomainId:
 *         type: string
 *         example: 5df780cc50b2d42fd00dc872
 *       subDomainName:
 *         type: string
 *         example: Ionic Bonds
 *       isAnswered:
 *         type: string
 *         enum:
 *           - r
 *           - y
 *           - g
 *       parameters:
 *         type: object
 *       type:
 *         type: string
 *         example: MCQ
 *       objectOrExplanation:
 *          type: string
 *          enum:
 *            - Q
 *            - X
 */

router.get("/interactive-quizs", async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 14;

  delete req.query.page;
  delete req.query.limit;
  for await (let item of ["object", "domainName", "subDomainName"])
    if (req.query[item]) {
      const searchValue = req.query[item];
      req.query[item] = { $regex: new RegExp(searchValue), $options: "i" };
    }
  const data = await interactiveQuizSchema.paginate(req.query, {
    page,
    limit,
    sort: { updatedAt: "desc" },
  });
  res.json(data);
});

router.post("/interactive-quizs", async (req, res) => {
  const {quizName,language,domainId,subDomainId,domainName,subDomainName,quizSchedule,quizDuration,totalGrade,ThePassScore,complexity,questionList} = req.body
  console.log(questionList,"questionList")
  const newObj =  await new interactiveQuizSchema({ 
    quizName,
    language,
    domainId,
    subDomainId,
    domainName,
    subDomainName,
    quizSchedule,
    quizDuration,
    totalGrade,
    ThePassScore,
    complexity,
    questionList }).save();
  if(newObj) res.json(newObj)
});

router.post("/postID_Quize/:id", async (req, res) => {
  const questionsArray = req.body.questionsArray
  let obj = await interactiveQuizSchema.findById(req.params.id)
  obj.questionList.push(...questionsArray)
  await obj.save()
  res.send("Data send successfully")
});
router.get("/postID_Quize", async (req, res) => {
  res.json(dataArray)
});




router.get('questions', (req, res) => {
  const questions = [
    'Question 1?',
    'Question 2?',
    'Question 3?',
    // Add more questions
  ];
  res.json(questions);
});

router.post('submit', (req, res) => {
  const answers = req.body.answers;
  // Score the answers and send back the result
  // For simplicity, let's just log the answers here
  console.log('Submitted answers:', answers);
  res.send('Quiz submitted successfully!');
});
router.get("/interactive-quizs/:id", async (req, res) => {
  let obj = await interactiveQuizSchema.findById(req.params.id).populate('questionList');
  res.status(200).json(obj);
});
router.get("/questionInQuize/:id", async (req, res) => {
  let obj = await interactiveQuizSchema.findById(req.params.id).populate('questionList');
  res.status(200).json(obj.questionList);
});
router.patch("/interactive-quizs/:id", (req, res) => {
  const id = req.params.id;
  const obj = { _id: id };
  for (let key in req.body) {
    if (req.body.hasOwnProperty(key)) {
      if (key === "questionList" && typeof req.body[key] === "string")
        obj[key] = JSON.parse(req.body[key]);
      else obj[key] = req.body[key];
    }
  }

  obj.updatedAt = Date.now();
  interactiveQuizSchema.updateOne(
    { _id: id },
    {
      $set: obj,
    },
    { new: false, runValidators: true, returnNewDocument: true, upsert: true },
    (err, doc) => {
      if (!err) {
        res.status(200).json(obj);
      } else {
        res.status(500).json(err);
      }
    }
  );
});
router.delete("/interactive-quizs/:id", async (req, res) => {
  interactiveQuizSchema
    .findByIdAndRemove(req.params.id)
    .then((doc) => {
      res.status(200).json("Object deleted successfully.");
    })
    .catch((err) => {
      res.status(500).json(`Can't delete object: ${err}`);
    });
});

module.exports = router;
