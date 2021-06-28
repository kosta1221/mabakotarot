const sharp = require("sharp");

const convertImageToWebP = async (filePath, site, fileName) => {
  await sharp(filePath).toFile(
    `headlines/${site}/${fileName}.webp`,
    (err, info) => {
      if (err) {
        console.error(err);
      }
      return info;
    }
  );
};

module.exports = convertImageToWebP;
