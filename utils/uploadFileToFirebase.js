import storage from "../config/firebase.js";
/**
 * @function  uploadFileToFirebase
 * @param {*} oldImage
 * @param {*} newImage
 * @param {*} oldImagePath
 * @param {*} newImagePath
 * @returns   imageURL
 */
const uploadFileToFirebase = async (
  oldImage,
  newImage,
  oldImagePath,
  newImagePath
) => {
  let imageURL = "";
  // Delete old image file from firebase storage if exists before uploading new one
  if (oldImage) {
    await deleteFileToFirebase(oldImagePath);
  }

  // Upload image file to firebase storage
  const blob = storage.file(newImagePath);
  const options = {
    destination: newImagePath, // Destination path within your bucket
    resumable: false, // Force a multipart upload
    public: true, // Make the uploaded file public
    metadata: {
      contentType: newImage.mimetype, // Set the content type to the image file
    },
  };

  // Upload new image file to firebase storage
  await blob
    .save(newImage.buffer, options)
    .then(() => {
      imageURL = `https://storage.googleapis.com/${storage.name}/${newImagePath}`;
    })
    .catch((error) => {
      throw new Error("Error uploading image file");
    });

  return imageURL;
};

// Delete image file from firebase storage
export const deleteFileToFirebase = async (oldImagePath) => {
  await storage
    .file(oldImagePath)
    .delete()
    .catch(() => {});
};

export default uploadFileToFirebase;
