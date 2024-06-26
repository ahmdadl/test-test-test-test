mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const deepPopulate = require('mongoose-deep-populate');
const findVisible = require('./findVisible');

const languages = Object.freeze({
    English: 'en',
    Arabic: 'ar',
    French: 'fr',
    Spanish: 'es',
    Italian: 'it',
    Deutsch: 'de',
});
const objID = mongoose.Types.ObjectId;
var interactiveQuizSchema = new mongoose.Schema(
    {
        // _id: mongoose.Schema.Types.ObjectId,
        //required: "this field is required."
        quizName: { type: String },
        language: {
            type: String,
            enum: Object.values(languages),
        },
        domainId: { type: String },
        subDomainId: { type: String },
        domainName: {
            type: String,
        },
        subDomainName: {
            type: String,
        },
        quizSchedule: {
            type: Date,
            default: Date.now,
        },
        quizDuration: {
            type: String,
        },
        totalGrade: {
            type: Number,
            default: 100,
        },
        ThePassScore: {
            type: Number,
            default: 50,
        },
        complexity: {
            type: String,
        },
        questionList: [
            {
                // type: Object,
                type: mongoose.Types.ObjectId,
                ref: 'interactiveObjectSchema',
            },
        ],
        isAutoGenerated: {
            type: Boolean,
            default: false,
        },
        criterias: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'CriteriaSchema',
            },
        ],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        collection: 'InteractiveQuiz',
        versionKey: false,
    }
);
// const population = [{
//   path: 'questionList',
//   match:{isVisible: true},
// },]
// interactiveQuizSchema.pre('find',findVisible(population));
// interactiveQuizSchema.pre('findOne',findVisible(population));
// interactiveQuizSchema.pre('findOneAndUpdate',findVisible());
// interactiveQuizSchema.pre('count',findVisible());
// interactiveQuizSchema.pre('countDocuments',findVisible());

// interactiveQuizSchema.plugin(deepPopulate, {})
interactiveQuizSchema
    .virtual('objId')
    .get(function () {
        return this._id.toString();
    })
    .set(function (x) {
        this._id = x;
    });

interactiveQuizSchema.plugin(mongoosePaginate);

module.exports = {
    interactiveQuizSchema: mongoose.model(
        'interactiveQuizSchema',
        interactiveQuizSchema
    ),
};
