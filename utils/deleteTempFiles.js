import fs from "fs";
import path from "path";

const UPLOADS_FOLDER = "uploads";

// Delete specific temporary files
const deleteTempFiles = (files) => {
  files.forEach((file) => {
    if (!file) return;
    fs.unlink(file.path, (err) => {
      if (err) console.log("Failed to delete file", file.path, err.message);
    });
  });
};

// Delete all files in the uploads/ folder
const clearUploadsFolder = () => {
  fs.readdir(UPLOADS_FOLDER, (err, files) => {
    if (err) {
      console.error("Failed to read uploads folder:", err.message);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(UPLOADS_FOLDER, file);
      fs.unlink(filePath, (err) => {
        if (err) console.log("Failed to delete file", filePath, err.message);
      });
    });
  });
};

// Call `clearUploadsFolder` when the server starts to clean up old temporary files
// clearUploadsFolder();

export { deleteTempFiles, clearUploadsFolder };
