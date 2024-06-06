mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const objID = mongoose.Types.ObjectId;
var ExamQuestionSchema = new mongoose.Schema(
    {
        questionId: { type: String },
        questionName: {
            type: String,
        },
        studentId: { type: String },
        studentTitle: {
            type: String,
        },
        answer: { type: String },
        isSuccess: { type: Boolean },

        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },

    {
        collection: 'exam-questions',
        versionKey: false,
    }
);

ExamQuestionSchema.virtual('objId')
    .get(function () {
        return this._id.toString();
    })
    .set(function (x) {
        this._id = x;
    });

ExamQuestionSchema.plugin(mongoosePaginate);

module.exports = {
    ExamQuestionSchema: mongoose.model(
        'ExamQuestionSchema',
        ExamQuestionSchema
    ),
};
