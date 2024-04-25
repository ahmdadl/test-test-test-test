require("dotenv").config();
const express = require("express");
let router = express.Router();
let mongoose = require("mongoose");
let interactiveObjectSchema =
  require("../models/interactive-object.model").interactiveObjectSchema;
let InteractiveObjectTypeSchema = require("../models/object-types.model").InteractiveObjectTypeSchema;
const fs = require("fs")
const path = require("path")
const request = require("request")

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

router.get("/interactive-objects", async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  delete req.query.page;
  delete req.query.limit;
  for await (let item of ["object", "domainName", "subDomainName"])
    if (req.query[item]) {
      const searchValue = req.query[item];
      req.query[item] = { $regex: new RegExp(searchValue), $options: "i" };
    }
  const data = await interactiveObjectSchema.paginate(req.query, {
    page,
    limit,
    sort: { updatedAt: "desc" },
  });
  res.json(data);
});

router.get("/isAnswered", async (req, res) => {
  const { isAnswered } = req.body
  let obj = await interactiveObjectSchema.find({isAnswered:"g"});
  res.status(200).json(obj);
});
router.post("/interactive-objects", async (req, res) => {
  const newObj = new interactiveObjectSchema({ _id: false });
  newObj.objId = new mongoose.Types.ObjectId();

  for (let key in req.body) {
    if (Object.hasOwnProperty.bind(req.body)(key)) {
      if (key === "parameters" && typeof req.body[key] === "string")
        newObj[key] = JSON.parse(req.body[key]);
      else newObj[key] = req.body[key];
    }
  }

  newObj.save((err, doc) => {
    if (!err) {
      res.status(200).json(newObj);
    } else {
      console.log(err);
      res.status(406).json(`Not Acceptable: ${err}`);
    }
  });
});

router.get("/interactive-objects/:id", async (req, res) => {
  let obj = await interactiveObjectSchema.findById(req.params.id);
  res.status(200).json(obj);
});

router.patch("/interactive-objects/:id", (req, res) => {
  const id = req.params.id;
  const obj = { _id: id };
  for (let key in req.body) {
    if (req.body.hasOwnProperty(key)) {
      if (key === "parameters" && typeof req.body[key] === "string")
        obj[key] = JSON.parse(req.body[key]);
      else obj[key] = req.body[key];
    }
  }

  obj.updatedAt = Date.now();
  interactiveObjectSchema.updateOne(
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
router.delete("/interactive-objects/:id", async (req, res) => {
  interactiveObjectSchema
    .findByIdAndRemove(req.params.id)
    .then((doc) => {
      res.status(200).json("Object deleted successfully.");
    })
    .catch((err) => {
      res.status(500).json(`Can't delete object: ${err}`);
    });
});

router.get("/createObject/:id", async (req, res) => {
  // get object
  console.log('createObject');
  let obj = await interactiveObjectSchema.findById(req.params.id);
  const { type, h5pString, questionName,  } = obj;
  let typeData = await InteractiveObjectTypeSchema.find({ typeName: type });
  const { templateJson, templateUrl } = typeData[0]
  console.log(templateUrl);
  request.get(templateUrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var html = body;
        for (let key in templateJson) {
          let replacedText = JSON.stringify(templateJson[key])
          replacedText = replacedText.substring(1, replacedText.length-1)
          let newText = JSON.stringify(h5pString[key])
          newText = newText.substring(1, newText.length-1)
          html = html.replace(replacedText, newText);
        }
        const outputPath = path.join(`${__dirname}/../uploads/${questionName}.html`)
          fs.writeFileSync(outputPath, html)
          res.send(`${process.env.APP_URL}/uploads/${questionName}.html`);
    } else console.log(error)
});

  
});

module.exports = router;
