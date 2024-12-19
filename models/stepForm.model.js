const mongoose = require('mongoose');

const stepFormSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    formId: {
        type: String,
    },
    files: [
      {
        public_id:{
            type:String
        },
        secure_url:{
            type:String
        },
      },
    ],
  },
  { timestamps: true } // Automatically tracks the creation and update times
);

module.exports = mongoose.model('StepForm', stepFormSchema);
