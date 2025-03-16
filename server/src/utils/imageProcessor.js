const sharp = require('sharp');
const path = require('path');

const processAvatar = async (file) => {
  const outputFilename = file.filename;
  const outputPath = path.join(file.destination, outputFilename);

  try {
    // 處理圖片：調整大小為 200x200，保持比例，轉換為 webp 格式
    await sharp(file.path)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 80 })
      .toFile(outputPath + '.webp');

    // 返回處理後的文件名
    return outputFilename + '.webp';
  } catch (error) {
    throw new Error('圖片處理失敗：' + error.message);
  }
};

module.exports = {
  processAvatar
}; 