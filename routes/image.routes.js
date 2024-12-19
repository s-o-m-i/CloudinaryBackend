const express = require("express")
const controllers = require("../controllers/image.controller")
const router = express.Router()
const upload = require("../utils/multer");
const uploadStepFormFiles = require("../utils/multiMulter");
const multer = require("multer");
const uploads = require("../utils/anyMulter");



router.route("/submit").post(uploads.any(),controllers.submit)
router.route("/fetchData").get(controllers.fetchData)
router.route("/getUpdatedForm/:id").get(controllers.getUpdatedForm)
router.route("/updatedForm/:id").put(uploads.any(),controllers.updatedForm)
router.route("/delete/:id").delete(controllers.handleDelete)
router.route("/delete-form/:id").delete(controllers.handleDeleteForm)
module.exports = router