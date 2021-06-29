require("dotenv").config();
const fs = require("fs");
const AWS = require("aws-sdk");
const sharp = require("sharp");

const s3 = new AWS.S3({
	accessKeyId: process.env.S3_ACCESS_KEY_ID,
	secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
});

const uploadFileToS3 = async (filePath, s3Path) => {
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
					console.log("\x1b[31m%s\x1b[0m", `File uploaded successfully. ${data.Location}`);
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

const deleteFromS3 = async (s3Path) => {
	const params = {
		Bucket: process.env.BUCKET_NAME,
		Key: s3Path,
	};

	s3.deleteObject(params, function (err, data) {
		if (err) console.log(err);
		else console.log("deleted from s3. data: ", data);
	});
};

const findIfExistsInS3 = async (s3Path) => {
	const params = {
		Bucket: process.env.BUCKET_NAME,
		Key: s3Path,
	};

	try {
		const headCode = await s3.headObject(params).promise();
		const signedUrl = s3.getSignedUrl("getObject", params);
		// Do something with signedUrl
		return true;
	} catch (headErr) {
		if (headErr.code === "NotFound") {
			console.log("not found in s3");
			// Handle no object on cloud here
			return false;
		} else {
			console.log(headErr);
		}
	}
};

module.exports = { uploadFileToS3, deleteFromS3, findIfExistsInS3 };
