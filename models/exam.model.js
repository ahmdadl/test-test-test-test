mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const objID = mongoose.Types.ObjectId;
var ExamSchema = new mongoose.Schema(
    {
        name: { type: String },
        studentId: { type: String },
        studentName: {
            type: String,
        },
        quizId: { type: String },
        quizTitle: {
            type: String,
        },
        isPassed: { type: Boolean },
        successPercentage: { type: Number },
        questionList: [
            { type: mongoose.Schema.Types.ObjectId, ref: 'ExamQuestionSchema' },
        ],

        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },

    {
        collection: 'exams',
        versionKey: false,
    }
);

ExamSchema.virtual('objId')
    .get(function () {
        return this._id.toString();
    })
    .set(function (x) {
        this._id = x;
    });

ExamSchema.plugin(mongoosePaginate);

module.exports = {
    ExamSchema: mongoose.model('ExamSchema', ExamSchema),
};
