mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const objID = mongoose.Types.ObjectId;
var TopicSchema = new mongoose.Schema(
    {
        title: { type: String, required: 'This field is required.' },
        domainId: { type: String },
        domainName: {
            type: String,
        },
        subDomainId: { type: String },
        subDomainName: {
            type: String,
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },

    {
        collection: 'topics',
        versionKey: false,
    }
);

TopicSchema.virtual('objId')
    .get(function () {
        return this._id.toString();
    })
    .set(function (x) {
        this._id = x;
    });

TopicSchema.plugin(mongoosePaginate);

module.exports = {
    TopicSchema: mongoose.model('TopicSchema', TopicSchema),
};
