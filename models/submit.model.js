const mongoose = require('mongoose');

const StepFormSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  files: [
    {
      publicId: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],
});

const MainSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dropDown: { type: String, required: true },
  stepForms: [StepFormSchema],
  image: [
    {
      publicId: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],
});

const MainModel = mongoose.model('Main', MainSchema);

module.exports = MainModel;
