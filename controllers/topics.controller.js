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
const TopicSchema = require('../models/tobic.model').TopicSchema;
const dataArray = [];

router.get('/topics', async (req, res) => {
    const query = req.query;

    const page = query.page || 1;
    const limit = query.limit || 14;
    const paginate = query.paginate || '';

    delete query.page;
    delete query.limit;
    delete query.paginate;

    if (query['subDomainName']) {
        const searchValue = query['subDomainName'];
        query['subDomainName'] = {
            $regex: new RegExp(searchValue),
            $options: 'i',
        };
    }

    if (paginate === 'false') {
        return res.json(await TopicSchema.find(query));
    }

    const topics = await TopicSchema.paginate(query, {
        page,
        limit,
        sort: { updatedAt: 'desc' },
    });

    const topicsWithQuestionCount = await Promise.all(
        topics.docs.map(async (topic) => {
            const questionCount = await interactiveObjectSchema.countDocuments({
                topicId: topic._id,
            });
            return { ...topic.toObject(), questionCount };
        })
    );

    return res.json({
        ...topics,
        docs: topicsWithQuestionCount,
    });
});

router.post('/topics', async (req, res) => {
    const { title, domainId, domainName, subDomainId, subDomainName } =
        req.body;

    const topic = await new TopicSchema({
        title,
        domainId,
        domainName,
        subDomainId,
        subDomainName,
    }).save();
    if (topic) res.json(topic);
});

router.get('/topics/:id', async (req, res) => {
    if (isNotValidObjectId(req.params.id))
        return res.status(404).json('Invalid ID');

    const topic = await TopicSchema.findById(req.params.id);
    return res.status(200).json(topic);
});

router.put('/topics/:id', async (req, res) => {
    if (isNotValidObjectId(req.params.id))
        return res.status(404).json('Invalid ID');

    const obj = { _id: req.params.id };
    for (let key in req.body) {
        if (req.body.hasOwnProperty(key)) {
            obj[key] = req.body[key];
        }
    }
    obj.updatedAt = Date.now();

    TopicSchema.updateOne(
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

router.delete('/topics/:id', async (req, res) => {
    if (isNotValidObjectId(req.params.id))
        return res.status(404).json('Invalid ID');

    try {
        const deletedTopic = await TopicSchema.findByIdAndDelete(req.params.id);
        if (!deletedTopic) {
            res.status(404).send('topic not found');
        }
        res.status(200).send(deletedTopic);
    } catch (error) {
        res.status(400).send('Error deleting topic:');
    }
});

router.post('/topics-criteria/:quizId', async (req, res) => {
    if (isNotValidObjectId(req.params.quizId))
        return res.status(404).json('Invalid ID');

    const questions = await interactiveObjectSchema.find({
        topicId: req.body.topicId,
    });

    const body = {
        topicId: req.body.topicId,
        numberOfQuestions: Number(req.body.numberOfQuestions),
        duration: Number(req.body.duration),

        easyPercentage: Number(req.body.easyPercentage),
        mediumPercentage: Number(req.body.mediumPercentage),
        hardPercentage: Number(req.body.hardPercentage),

        mcqPercentage: Number(req.body.mcqPercentage),
        fillTheBlankPercentage: Number(req.body.fillTheBlankPercentage),
        trueFalsePercentage: Number(req.body.trueFalsePercentage),
    };

    const totalQuestions =
        body.numberOfQuestions > questions.length
            ? questions.length
            : body.numberOfQuestions;

    /**
     * First calculate for type
     */
    const mcqCount = Math.round(
        (body.mcqPercentage / totalQuestions) * totalQuestions
    );
    const fillCount = Math.round(
        (body.fillCount / totalQuestions) * totalQuestions
    );
    const trueCount = Math.round(
        (body.trueFalsePercentage / totalQuestions) * totalQuestions
    );

    const mcqQuestions = questions
        .filter((q) => q.type === 'MCQ')
        .slice(0, mcqCount);
    const fillQuestions = questions
        .filter((q) => q.type === 'FillTheBlank')
        .slice(0, fillCount);
    const trueQuestions = questions
        .filter((q) => q.type === 'true-false')
        .slice(0, trueCount);

    let selectedQuestions = [
        ...mcqQuestions,
        ...fillQuestions,
        ...trueQuestions,
    ];

    /**
     * second calculate for level
     */
    const easyCount = Math.round(
        (body.easyPercentage / totalQuestions) * totalQuestions
    );
    const mediumCount = Math.round(
        (body.mediumPercentage / totalQuestions) * totalQuestions
    );
    const hardCount = Math.round(
        (body.hardPercentage / totalQuestions) * totalQuestions
    );

    // Filter questions based on level
    const easyQuestions = selectedQuestions
        .filter((q) => q.complexity == 'easy')
        .slice(0, easyCount);
    const mediumQuestions = selectedQuestions
        .filter((q) => q.complexity == 'medium')
        .slice(0, mediumCount);
    const hardQuestions = selectedQuestions
        .filter((q) => q.complexity == 'hard')
        .slice(0, hardCount);

    selectedQuestions = [
        ...easyQuestions,
        ...mediumQuestions,
        ...hardQuestions,
    ];

    /**
     * Last update quiz with new list
     */
    const id = req.params.quizId;
    const obj = { _id: id };

    obj['questionList'] = selectedQuestions.map((x) => x._id);

    obj.updatedAt = Date.now();
    interactiveQuizSchema.updateOne(
        { _id: id },
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

module.exports = router;
