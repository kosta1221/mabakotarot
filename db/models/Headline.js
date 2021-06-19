const mongoose = require("mongoose");

const headlineSchema = new mongoose.Schema({
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
