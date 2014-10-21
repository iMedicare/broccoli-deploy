var fs    = require('fs')
var path  = require('path')
var glob  = require('glob')
var chalk = require('chalk')
var AWS   = require('aws-sdk')

module.exports = {

  run: function(outputPath, bucket) {
    this.client = new AWS.S3()
    this.outputPath = outputPath
    this.bucket = bucket

    return glob(outputPath + '/**/*', this.processFiles.bind(this))
  },

  processFiles: function(error, filePaths) {
    if (error) {
      throw new Error(error)
    } else {
      console.log('Deploying files to %s S3 bucket', chalk.underline(this.bucket))
      return filePaths.map(this.uploadFile.bind(this))
    }
  },

  isFile: function(filePath) {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile()
  },

  uploadFile: function(filePath) {
    if (this.isFile(filePath)) {
      var fileData = fs.readFileSync(filePath)
      var relativeFilePath = filePath.replace(this.outputPath + '/', '')
      var params = {
        ACL: 'public-read',
        Bucket: this.bucket,
        Body: fileData,
        Key: relativeFilePath
      }
      return this.client.putObject(params, this.afterUpload.bind(this, relativeFilePath))
    }
  },

  afterUpload: function(file, error, data) {
    if (error) {
      console.log(chalk.red('S3 Upload failed:'), error)
    } else {
      console.log(chalk.green('Uploaded'), chalk.yellow(file))
    }
  }
}