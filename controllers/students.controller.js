require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
let router = express.Router();
let mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const request = require('request');
const isNotValidObjectId = require('../utils/helpers');
const { InteractiveObjectTypeSchema } = require('../models/object-types.model');
const { interactiveQuizSchema } = require('../models/interactive-quiz.model');
const {
    interactiveObjectSchema,
} = require('../models/interactive-object.model');
const StudentSchema = require('../models/student.model').StudentSchema;
const dataArray = [];

router.get('/students', async (req, res) => {
    const query = req.query;

    const page = query.page || 1;
    const limit = query.limit || 14;
    const paginate = query.paginate || '';

    delete query.page;
    delete query.limit;
    delete query.paginate;

    const students = await StudentSchema.paginate(query, {
        page,
        limit,
        sort: { updatedAt: 'desc' },
    });

    return res.json({
        ...students,
    });
});

router.post('/students', async (req, res) => {
    const { name } = req.body;

    const student = await new StudentSchema({
        name,
    }).save();
    if (student) res.json(student);
});

router.get('/students/:id', async (req, res) => {
    if (isNotValidObjectId(req.params.id))
        return res.status(404).json('Invalid ID');

    const student = await StudentSchema.findById(req.params.id);
    return res.status(200).json(student);
});

router.put('/students/:id', async (req, res) => {
    if (isNotValidObjectId(req.params.id))
        return res.status(404).json('Invalid ID');

    const obj = { _id: req.params.id };
    for (let key in req.body) {
        if (req.body.hasOwnProperty(key)) {
            obj[key] = req.body[key];
        }
    }
    obj.updatedAt = Date.now();

    StudentSchema.updateOne(
        { _id: req.params.id },
        {
            $set: obj,
        },
        {
            new: false,
            runValidators: true,
            returnNewDocument: true,
            upsert: true,
        },
        (err, doc) => {
            if (!err) {
                res.status(200).json(obj);
            } else {
                res.status(500).json(err);
            }
        }
    );
});

router.delete('/students/:id', async (req, res) => {
    if (isNotValidObjectId(req.params.id))
        return res.status(404).json('Invalid ID');

    try {
        const deletedStudent = await StudentSchema.findByIdAndDelete(
            req.params.id
        );
        if (!deletedStudent) {
            res.status(404).send('student not found');
        }
        res.status(200).send(deletedStudent);
    } catch (error) {
        res.status(400).send('Error deleting student:');
    }
});

module.exports = router;
