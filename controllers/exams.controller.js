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
const { ExamQuestionSchema } = require('../models/exam-questions.model');
const ExamSchema = require('../models/exam.model').ExamSchema;
const dataArray = [];

router.get('/exams', async (req, res) => {
    const query = req.query;

    const page = query.page || 1;
    const limit = query.limit || 14;
    const paginate = query.paginate || '';

    delete query.page;
    delete query.limit;
    delete query.paginate;

    const exams = await ExamSchema.paginate(query, {
        page,
        limit,
        sort: { updatedAt: 'desc' },
    });

    return res.json({
        ...exams,
    });
});

router.post('/exams', async (req, res) => {
    const {
        name,
        studentId,
        studentName,
        quizId,
        quizTitle,
        isPassed,
        successPercentage,
        questionList,
    } = req.body;

    const questions = [];
    for (const {
        questionId,
        questionName,
        studentId,
        studentTitle,
        answer,
        isSuccess,
    } of questionList) {
        const examQuestion = await new ExamQuestionSchema({
            questionId,
            questionName,
            studentId,
            studentTitle,
            answer,
            isSuccess,
        });
        questions.push(examQuestion);
    }

    const exam = await new ExamSchema({
        name,
        studentId,
        studentName,
        quizId,
        quizTitle,
        isPassed,
        successPercentage,
        questionList: questions,
    }).save();
    if (exam) res.json(exam);
});

router.get('/exams/:id', async (req, res) => {
    if (isNotValidObjectId(req.params.id))
        return res.status(404).json('Invalid ID');

    const exam = await ExamSchema.findById(req.params.id);
    return res.status(200).json(exam);
});

router.put('/exams/:id', async (req, res) => {
    if (isNotValidObjectId(req.params.id))
        return res.status(404).json('Invalid ID');

    const obj = { _id: req.params.id };
    for (let key in req.body) {
        if (req.body.hasOwnProperty(key)) {
            obj[key] = req.body[key];
        }
    }
    obj.updatedAt = Date.now();

    ExamSchema.updateOne(
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

router.delete('/exams/:id', async (req, res) => {
    if (isNotValidObjectId(req.params.id))
        return res.status(404).json('Invalid ID');

    try {
        const deletedExam = await ExamSchema.findByIdAndDelete(req.params.id);
        if (!deletedExam) {
            res.status(404).send('exam not found');
        }
        res.status(200).send(deletedExam);
    } catch (error) {
        res.status(400).send('Error deleting exam:');
    }
});

module.exports = router;
