import fs from "fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import sharp from "sharp";
import axios from "axios";

import sizeOf from "buffer-image-size";

export const getDiffFromUrl = async (s3Url1, s3Url2) => {
  console.log("url 1: ", s3Url1);
  console.log("url 2: ", s3Url2);

  const { data: data1 } = await axios({
    url: s3Url1,
    method: "GET",
    responseType: "arraybuffer",
  });

  const { data: data2 } = await axios({
    url: s3Url2,
    method: "GET",
    responseType: "arraybuffer",
  });

  // console.log(data1, data2);
  const { width: width1, height: height1 } = sizeOf(data1);
  const { width: width2, height: height2 } = sizeOf(data2);

  console.log("width1: ", width1, "height1: ", height1);
  console.log("width2: ", width2, "height2: ", height2);

  if (width1 !== width2 || height1 !== height2) {
    throw new Error("Different image dimensions!");
  }

  const dataSharp1 = await sharp(data1).png().toBuffer();
  const dataSharp2 = await sharp(data2).png().toBuffer();
  const img1 = PNG.sync.read(dataSharp1);
  const img2 = PNG.sync.read(dataSharp2);

  const diff = new PNG({ width: width1, height: height1 });

  const diffNum = pixelmatch(img1.data, img2.data, diff.data, width1, height1, { threshold: 0.1 });
  const diffPercentage = (diffNum / (width1 * height1)) * 100;

  console.log("diffNum: ", diffNum);
  console.log("diffPercentage: ", diffPercentage);

  fs.writeFileSync(`ignore/diff.png`, PNG.sync.write(diff));

  return { diffNum, diffPercentage, diff };
};

export const getDiffFromUrlAndPath = async (s3Url1, path2) => {
  const { data } = await axios({
    url: s3Url1,
    method: "GET",
    responseType: "arraybuffer",
  });

  const dataSharp1 = await sharp(data).png().toBuffer();

  const img1 = PNG.sync.read(dataSharp1);
  const img2 = PNG.sync.read(fs.readFileSync(path2));

  const { width: width1, height: height1 } = sizeOf(data);
  const { width: width2, height: height2 } = img2;

  // console.log("width1: ", width1, "height1: ", height1, "width2: ", width2, "height2: ", height2);

  if (width1 !== width2 || height1 !== height2) {
    throw new Error("Different image dimensions!");
  }

  const diff = new PNG({ width: width1, height: height1 });

  const diffNum = pixelmatch(img1.data, img2.data, diff.data, width1, height1, { threshold: 0.1 });
  const diffPercentage = (diffNum / (width1 * height1)) * 100;

  console.log("diffPercentage: ", diffPercentage);

  fs.writeFileSync(`/tmp/diff-${path2.split("/")[2]}.png`, PNG.sync.write(diff));

  return { diffNum, diffPercentage, diff };
};
