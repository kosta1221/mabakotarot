const fs = require("fs");
const PNG = require("pngjs").PNG;
const pixelmatch = require("pixelmatch");
const sharp = require("sharp");
const { DateTime } = require("luxon");
const axios = require("axios");
const sizeOf = require("buffer-image-size");

const getDiff = async (options) => {
	const { site1, site2, year1, month1, day1, hour1, minute1, year2, month2, day2, hour2, minute2 } =
		options;

	const dateTime1 = new DateTime(DateTime.local()).set({
		hour: hour1,
		minute: minute1,
		day: day1,
		month: month1,
		year: year1,
	});
	const dateTime2 = new DateTime(DateTime.local()).set({
		hour: hour2,
		minute: minute2,
		day: day2,
		month: month2,
		year: year2,
	});

	const fileName1 = dateTime1.toFormat("yyyy-MM-dd_HH-mm");
	const fileName2 = dateTime2.toFormat("yyyy-MM-dd_HH-mm");
	console.log(fileName1);
	console.log(fileName2);

	const s3Url1 = `https://mabakotarot.s3.amazonaws.com/${site1}/${fileName1}.webp`;
	const s3Url2 = `https://mabakotarot.s3.amazonaws.com/${site2}/${fileName2}.webp`;

	const { data: data1 } = await axios({
		url: s3Url1,
		method: "GET",
		responseType: "arraybuffer",
		responseEncoding: "binary",
	});

	const { data: data2 } = await axios({
		url: s3Url2,
		method: "GET",
		responseType: "arraybuffer",
		responseEncoding: "binary",
	});

	// console.log(data1, data2);
	// const img1 = PNG.sync.read(fs.readFileSync("headlines/ynet/2021-07-01_21-15.png"));
	// const img2 = PNG.sync.read(fs.readFileSync("headlines/n12/2021-07-01_21-15.png"));
	const { width: width1, height: height1 } = sizeOf(data1);
	const { width: width2, height: height2 } = sizeOf(data2);
	console.log("width1: ", width1, "height1: ", height1);
	console.log("width2: ", width2, "height2: ", height2);

	const dataSharp1 = await sharp(data1).png().toBuffer();
	const dataSharp2 = await sharp(data2).png().toBuffer();
	const img1 = PNG.sync.read(dataSharp1);
	const img2 = PNG.sync.read(dataSharp2);

	const diff = new PNG({ width: width1, height: height1 });

	const diffNum = pixelmatch(img1.data, img2.data, diff.data, width1, height1, { threshold: 0.1 });
	console.log(diffNum);
	console.log((diffNum / (width1 * height1)) * 100);

	fs.writeFileSync("headlines/diff/diff.png", PNG.sync.write(diff));
};

getDiff({
	site1: "n12",
	site2: "ynet",
	day1: 1,
	hour1: 23,
	minute1: 45,
	day2: 1,
	hour2: 23,
	minute2: 30,
});
