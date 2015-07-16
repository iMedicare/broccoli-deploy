var fs     = require('fs');
var path   = require('path');
var glob   = require('glob');
var chalk  = require('chalk');
var mime   = require('mime');
var dotenv = require('dotenv');
var AWS    = require('aws-sdk');

dotenv.load();

module.exports = {

  run: function(outputPath, bucket, directory, gzip) {
    var env = process.env.BROCCOLI_ENV || 'development';
    this.env = {
      production: env === 'production'
    };
    this.client = new AWS.S3();
    this.outputPath = outputPath;
    this.bucket = bucket;
    this.directory = directory || './';
    this.gzip = gzip;

    return glob(outputPath + '/**/*', this.processFiles.bind(this));
  },

  processFiles: function(error, filePaths) {
    if (error) {
      throw new Error(error);
    } else {
      console.log('Deploying files to %s S3 bucket', chalk.underline(this.bucket));
      return filePaths.map(this.uploadFile.bind(this));
    }
  },

  isFile: function(filePath) {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  },

  uploadFile: function(filePath) {
    if (this.isFile(filePath)) {
      var fileData = fs.readFileSync(filePath);
      var relativeFilePath = filePath.replace(this.outputPath, '');
      var distFilePath = path.join(this.directory, relativeFilePath);
      var params = {
        ACL: 'public-read',
        Bucket: this.bucket,
        Body: fileData,
        CacheControl: 'max-age=' + (3600 * 24 * 360) + ', public'
      };
      if (distFilePath.slice(-3) === '.gz') {
        distFilePath = distFilePath.slice(0, -3);
        params.ContentEncoding = 'gzip';
      }
      params.ContentType = mime.lookup(distFilePath);
      params.Key = distFilePath;
      return this.client.putObject(params, this.afterUpload.bind(this, distFilePath));
    }
  },

  afterUpload: function(file, error, data) {
    if (error) {
      console.log(chalk.red('S3 Upload failed:'), error);
    } else {
      console.log(chalk.green('Uploaded'), chalk.yellow(file));
    }
  }
}
