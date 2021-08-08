const mongoose = require("mongoose");

// page Schema
const PageSchema = mongoose.Schema({
    title: {
        type:String,
        required: true
    },
    slug: {
        type: String
    },
    content: {
        type: String,
        required: true
    },
    sorting: {
        type: Number
    }
});

let Page = module.exports = mongoose.model('Page', PageSchema);