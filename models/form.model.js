const mongoose = require("mongoose")

const formSchema = new mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    dropDown: {
        type: String
    },
    public_id:{
        type:String
    },
    secure_url:{
        type:String
    },
    randomId: {
        type: String,
    },
    stepForms: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'StepForm', // Reference to the StepForm model
        },
      ],
}, { timestamps: true })

module.exports = mongoose.model("Form", formSchema);