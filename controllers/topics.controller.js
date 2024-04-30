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
        return res.json(await TopicSchema.find(query))
    }

    const data = await TopicSchema.paginate(query, {
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
