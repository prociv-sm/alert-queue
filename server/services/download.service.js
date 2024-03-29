const AdmZip = require('adm-zip');
const request = require('request');
const fs = require('fs');
const updaterService = require('../services/updater.service');

const FILE_URL =
  'https://raw.githubusercontent.com/pcm-dpc/DPC-Bollettini-Criticita-Idrogeologica-Idraulica/master/files/all/latest_all.zip';
const FILE_NAME = 'latest_all.zip';
const FILE_FS_PATH = `./uploads/${FILE_NAME}`;
const EXTRACTION_PATH = './uploads/ext/';

const downloadLatestZip = async () => {
  await new Promise((resolve, reject) => {
    try {
      fs.rmdirSync(EXTRACTION_PATH, { recursive: true });

      console.info(`${EXTRACTION_PATH} is deleted!`);
    } catch (err) {
      console.error(`Error while deleting ${EXTRACTION_PATH}.`);
    }

    request({ url: FILE_URL, encoding: null })
      .pipe(fs.createWriteStream(FILE_FS_PATH))
      .on('finish', () => {
        console.info(`The file is finished downloading.`);
        resolve();
      })
      .on('error', (error) => {
        reject(error);
      });
  }).catch((error) => {
    console.error(`Something happened: ${error}`);
  });

  const zip = new AdmZip(FILE_FS_PATH, {});
  zip.extractAllTo(EXTRACTION_PATH, true);

  await updaterService.updateEventData();
};

module.exports = {
  downloadLatestZip,
};
