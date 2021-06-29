const mongoose = require("mongoose");

const headlineSchema = new mongoose.Schema({
	site: {
		type: String,
		required: true,
	},
	date: {
		type: String,
		required: true,
	},
	fileName: {
		type: String,
		required: true,
	},
	imageUrl: {
		type: String,
		required: true,
	},
	titleText: {
		type: String,
		required: false,
	},
	subtitleText: {
		type: String,
		required: false,
	},
	titleArticleLink: {
		type: String,
		required: false,
	},
});

headlineSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		delete returnedObject.__v;
		returnedObject.id = returnedObject._id;
	},
});

module.exports = mongoose.model("Headline", headlineSchema);
