import mongoose from "mongoose";

export interface IHeadline {
  site: string;
  date: string;
  fileName: string;
  imageUrl: string;
  titleText: string;
  subtitleText: string;
  titleArticleLink: string;
  isTextUnique: string;
  diffToLastOfSite: number;
}

const headlineSchema = new mongoose.Schema<IHeadline>({
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
  isTextUnique: {
    type: String,
    required: false,
  },
  diffToLastOfSite: {
    type: Number,
    required: false,
  },
});

headlineSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    delete returnedObject.__v;
    returnedObject.id = returnedObject._id;
  },
});

const Headline = mongoose.model<IHeadline>("Headline", headlineSchema);
export default Headline;
