require("dotenv").config();
const fs = require("fs");
const AWS = require("aws-sdk");
const sharp = require("sharp");

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
});

const uploadFile = async (filePath, s3Path) => {
  try {
    // Read content from the file
    const fileContent = fs.readFileSync(filePath);

    // Converts the image to webp
    const data = await sharp(fileContent).webp().toBuffer();

    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: s3Path, // File name you want to save as in S3
      Body: data,
    };

    // Setting up S3 upload parameters
    return new Promise(async (resolve, reject) => {
      try {
        // Uploading files to the bucket
        s3.upload(params, function (err, data) {
          if (err) {
            throw err;
          }
          console.log(`File uploaded successfully. ${data.Location}`);
          resolve(data.Location);
        });
      } catch (error) {
        reject(error);
      }
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = uploadFile;
