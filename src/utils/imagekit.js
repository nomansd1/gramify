import ImageKit from "imagekit";
import fs from "fs";
import path from "path";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const uploadOnImageKit = async (localFilePath, folderPath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file to ImageKit
    const response = await imagekit.upload({
      file: fs.readFileSync(localFilePath), // Can also pass base64 or URL
      fileName: path.basename(localFilePath), // Required
      folder: folderPath, // Optional: saves in a specific folder
    });

    // Remove the file from local storage after successful upload
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    // Remove local file if upload fails
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error(error);
    return null;
  }
};

const deleteFromImageKit = async (fileId) => {
  try {

    if (!fileId) {
      console.log("File ID is required to delete from ImageKit");
      return;
    }

    await imagekit.deleteFile(fileId);
  
  } catch (error) {
    console.log("Error deleting file from ImageKit:", error);
  } 
};

export {
  uploadOnImageKit,
  deleteFromImageKit
};