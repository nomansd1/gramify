import ImageKit from "imagekit";
import fs from "fs";
import path from "path";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export const uploadOnImageKit = async (localFilePath, folderPath) => {
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

export const bulkUploadOnImageKit = (files, folderPath) => {
  if (!Array.isArray(files) || files.length === 0) return [];

  const uploads = files.map(async (file) => {
    try {
      const result = await uploadOnImageKit(file.url, folderPath);

      if (!result) {
        console.log(`Failed to upload file: ${file.url}`);
        return null;
      }
      return {
        type: result.fileType,
        url: result.url,
        fileId: result.fileId,
      };
    } catch (error) {
      console.error(`Error uploading file ${file.url}:`, error);
      return null;
    }
  });

  return Promise.all(uploads);
};

export const deleteFromImageKit = async (fileId) => {
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

