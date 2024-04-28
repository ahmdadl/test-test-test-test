require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
let router = express.Router();
let mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const request = require('request');
const isNotValidObjectId = require('../utils/helpers');
const TopicSchema = require('../models/tobic.model').TopicSchema;
const dataArray = [];

router.get('/topics', async (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 14;

    delete req.query.page;
    delete req.query.limit;

    if (req.query['subDomainName']) {
        const searchValue = req.query['subDomainName'];
        req.query['subDomainName'] = {
            $regex: new RegExp(searchValue),
            $options: 'i',
        };
    }

    const data = await TopicSchema.paginate(req.query, {
        page,
        limit,
        sort: { updatedAt: 'desc' },
    });
    return res.json(data);
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

module.exports = router;
