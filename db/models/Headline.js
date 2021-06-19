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
});

headlineSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		delete returnedObject.__v;
		returnedObject.id = returnedObject._id;
	},
});

module.exports = mongoose.model("Headline", headlineSchema);
