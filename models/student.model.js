mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const objID = mongoose.Types.ObjectId;
var StudentSchema = new mongoose.Schema(
    {
        name: { type: String, required: 'This field is required.' },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },

    {
        collection: 'students',
        versionKey: false,
    }
);

StudentSchema.virtual('objId')
    .get(function () {
        return this._id.toString();
    })
    .set(function (x) {
        this._id = x;
    });

StudentSchema.plugin(mongoosePaginate);

module.exports = {
    StudentSchema: mongoose.model('StudentSchema', StudentSchema),
};
