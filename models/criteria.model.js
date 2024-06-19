mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { required } = require('nodemon/lib/config');

const questionTypeSchema = new mongoose.Schema(
    {
        type: { type: String, required: true },
        easy: { type: Number, required: true },
        medium: { type: Number, required: true },
        hard: { type: Number, required: true },
    },
    { _id: false }
);

const objID = mongoose.Types.ObjectId;
var CriteriaSchema = new mongoose.Schema(
    {
        topicId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'TopicSchema',
        },
        topicTitle: {
            type: String,
        },
        duration: {
            type: Number,
        },
        numberOfQuestions: {
            type: Number,
        },
        questionTypes: [questionTypeSchema],
        selectedQuestions: { type: String, default: '' },

        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },

    {
        collection: 'criterias',
        versionKey: false,
    }
);

CriteriaSchema.virtual('objId')
    .get(function () {
        return this._id.toString();
    })
    .set(function (x) {
        this._id = x;
    });

CriteriaSchema.plugin(mongoosePaginate);

module.exports = {
    CriteriaSchema: mongoose.model('CriteriaSchema', CriteriaSchema),
};
