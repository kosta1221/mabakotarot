require("dotenv").config();
const fs = require("fs");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
	accessKeyId: process.env.S3_ACCESS_KEY_ID,
	secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
});

const uploadFile = (filePath, s3Path) => {
	// Read content from the file
	const fileContent = fs.readFileSync(filePath);

	// Setting up S3 upload parameters
	const params = {
		Bucket: process.env.BUCKET_NAME,
		Key: s3Path, // File name you want to save as in S3
		Body: fileContent,
	};

	// Uploading files to the bucket
	s3.upload(params, function (err, data) {
		if (err) {
			throw err;
		}
		console.log(`File uploaded successfully. ${data.Location}`);
	});
};

module.exports = uploadFile;
