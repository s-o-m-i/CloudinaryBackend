const cloudinary = require("cloudinary")
const Form = require("../models/form.model")
const stepFormModel = require("../models/stepForm.model")
const MainModel = require("../models/submit.model")



    const uploadFiles = async (files) => {
        const uploadedFiles = [];
    
        for (const file of files) {
            try {
                
                const result = await cloudinary.uploader.upload(file.path);
                console.log('File uploaded to Cloudinary:', result);
    
                uploadedFiles.push({
                    publicId: result.public_id,
                    url: result.secure_url,
                });
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }
    
        return uploadedFiles;
    };
    
    const submit = async (req, res) => {
        try {
            const { firstName, lastName, dropDown, stepForms } = req.body;
            const files = req.files;
    
            console.log("Received files=======>", files);
            console.log("Received stepForms=======>", stepForms);
    
            const rootFiles = [];
            const stepFiles = {};
    
            
            files.forEach(file => {
                if (file.fieldname === 'image') {
                    
                    rootFiles.push({
                        filename: file.filename,
                        path: file.path,
                    });
                } else {
                    
                    const stepIndexMatch = file.fieldname.match(/stepForms\[(\d+)\]\[files\]\[(\d+)\]/);
    
                    if (stepIndexMatch) {
                        const stepIndex = stepIndexMatch[1]; 
    
                        
                        if (!stepFiles[stepIndex]) {
                            stepFiles[stepIndex] = [];
                        }
    
                        
                        stepFiles[stepIndex].push({
                            filename: file.filename,
                            path: file.path,
                        });
                    }
                }
            });
    
            
            const uploadedRootFiles = await uploadFiles(rootFiles);
            const stepsWithFiles = stepForms && await Promise.all(stepForms?.map(async (step, index) => {
                
                const filesForStep = stepFiles[index] || [];
    
                
                const uploadedFilesForStep = await uploadFiles(filesForStep);
    
                
                return {
                    ...step,
                    files: uploadedFilesForStep,
                };
            }));
    
            console.log("Root files uploaded: ", uploadedRootFiles);
            console.log("Steps with uploaded files: ", stepsWithFiles);
    
            
            const EntryCreated = await MainModel.create({
                firstName,
                lastName,
                dropDown,
                stepForms: stepsWithFiles,
                image: uploadedRootFiles, 
            });
    
            if (!EntryCreated) {
                return res.status(400).json({ msg: "Failed to create entry" });
            }
    
            
            res.status(201).json({ msg: "Entry created successfully" });
        } catch (error) {
            console.error("Error:", error);
            res.status(500).json({ msg: "Internal server error" });
        }
    };

    const fetchData = async(req,res) => {
        try {
            const fetchedData = await MainModel.find()
            if(!fetchedData) return res.status(400).json({msg:"no data found"})
            res.status(200).json(fetchedData)
        } catch (error) {
            console.log(error)
        }
    }

    const getUpdatedForm = async (req,res) => {
        try {
            const {id} = req.params
            const data = await MainModel.findById(id)
            res.status(200).json(data)
            if(!data){
                return res.status(404).json({msg:"NO form found"})
            }
          
        } catch (error) {
            console.log(error)
        }
    }

    const updatedForm = async (req, res) => {
        try {
            const { id } = req.params;
            const { firstName, lastName, dropDown, stepForms } = req.body;
            const files = req.files;
    const updatedStepFormsFiles = req.body.stepForms
            const existingData = await MainModel.findById(id);
            if (!existingData) {
                return res.status(404).json({ msg: "Form not found" });
            }
    
            const rootFiles = [];
            const stepFiles = {};
    console.log(files)
            files.forEach(file => {
                if (file.fieldname === 'image') {
                    rootFiles.push({ filename: file.filename, path: file.path });
                } else {
                    const match = file.fieldname.match(/stepForms\[(\d+)\]\[files\]\[(\d+)\]/);
                    if (match) {
                        const stepIndex = match[1];
                        if (!stepFiles[stepIndex]) stepFiles[stepIndex] = [];
                        stepFiles[stepIndex].push({ filename: file.filename, path: file.path,publicId:file.publicId });
                    }
                }
            });
    
            
            let uploadedRootFiles = existingData.image;
            if (rootFiles.length > 0) {
                
                await Promise.all(existingData.image.map(img => cloudinary.uploader.destroy(img.publicId)));
                uploadedRootFiles = await uploadFiles(rootFiles);
            }
            const updatedStepForms = stepForms && await Promise.all(
                stepForms?.map(async (step, index) => {
                  const newFiles = stepFiles[index] || [];
                  let existingStepFiles = existingData.stepForms[index]?.files || [];
                  const matchedFiles = [];
                  let finded = "";
                  let previousFiles = [];
              
                  
                  updatedStepFormsFiles.forEach((stepForm) => {
                    stepForm.files.forEach((incomingFile) => {
                      
                      const publicIdToCheck = incomingFile.publicIdd || incomingFile.publicId;
              
                      
                      const foundFile = existingStepFiles.find((file) => file.publicId === publicIdToCheck);
              
                      if (foundFile) {
                        
                        matchedFiles.push(foundFile);
                        finded = foundFile.publicId;
                        console.log("Founded matching file:", foundFile);
                      } else {
        
                        previousFiles = existingStepFiles.filter((file) => file.publicId !== finded);
                      }
                    });
                  });
              
                  
                  if (newFiles.length > 0) {
                    await Promise.all(matchedFiles.map(file => cloudinary.uploader.destroy(file.publicId)));
                    existingStepFiles = await uploadFiles(newFiles);
                  }
              
                  let filess = [...previousFiles, ...existingStepFiles];
                  console.log("Final merged files ====>:", filess);
                  console.log("Mega final merged files ========> :", { ...step, files: filess });
              
                  return { ...step, files: filess };
                })
              );
              
              console.log("Updated step forms:", updatedStepForms);
              
    
            // Update the database with the new data
            const updatedData = await MainModel.findByIdAndUpdate(
                id,
                {
                    firstName: firstName || existingData.firstName,
                    lastName: lastName || existingData.lastName,
                    dropDown: dropDown || existingData.dropDown,
                    stepForms: updatedStepForms,
                    image: uploadedRootFiles,
                },
                { new: true }
            );
    
            res.status(200).json({ msg: "Form updated successfully", data: updatedData });
        } catch (error) {
            console.error("Error updating form:", error);
            res.status(500).json({ msg: "An error occurred while updating the form" });
        }
    };
    
    const handleDelete = async (req, res) => {
        try {
            const { id } = req.params; // Extract publicId from request parameters
            if (!id) return res.status(400).json({ msg: "Public Id is required" });
    
            const cloudinaryResponse = await cloudinary.v2.uploader.destroy(id);
            if(cloudinaryResponse.result !== "ok") {
                return res.status(400).json({msg:"Failed to delete image from cloudinary"})
            }
            
            const documentWithStepFormsUpdate  = await MainModel.findOneAndUpdate(
                { "stepForms.files.publicId": id }, 
                { $pull: { "stepForms.$[].files": { publicId: id } } }, 
                { new: true } 
            );

            const documentWithImageUpdate = await MainModel.findOneAndUpdate(
                { "image.publicId": id }, // Find in root-level image array
                { $pull: { image: { publicId: id } } }, // Remove image from root-level array
                { new: true } // Return the updated document
            );
    

            if (!documentWithStepFormsUpdate && !documentWithImageUpdate) {
                return res.status(404).json({ msg: "File not found in database" });
            }
    
            res.status(200).json({
                msg: "File deleted successfully from Cloudinary and database",
                data: documentWithStepFormsUpdate || documentWithImageUpdate,
            });
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Internal server error" });
        }
    };
    
    const handleDeleteForm = async (req,res) => {
        try {
            const { id } = req.params; 
        if (!id) return res.status(400).json({ msg: "Form Id is required" });
        const form = await MainModel.findById(id);
        if (!form) return res.status(404).json({ msg: "Form not found" });
        const imagePublicIds = [];
        form.stepForms.forEach(stepForm => {
            stepForm.files.forEach(file => {
                imagePublicIds.push(file.publicId);
            });
        });
        form.image.forEach(img => {
            imagePublicIds.push(img.publicId);
        });
        const cloudinaryResponses = await Promise.all(imagePublicIds.map(publicId => 
            cloudinary.uploader.destroy(publicId)
        ));
        const failedDeletions = cloudinaryResponses.filter(response => response.result !== "ok");
        if (failedDeletions.length > 0) {
            return res.status(400).json({ msg: "Failed to delete images from Cloudinary" });
        }

        const deletedForm = await MainModel.findByIdAndDelete(id);
        if (!deletedForm) {
            return res.status(404).json({ msg: "Failed to delete the form from the database" });
        }
        res.status(200).json({
            msg: "Form and all associated images deleted successfully",
            data: deletedForm,
        });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Internal server error", error: error.message });
            
        }
    }
    
      
    
module.exports = {submit,fetchData,getUpdatedForm,updatedForm,handleDelete,handleDeleteForm}