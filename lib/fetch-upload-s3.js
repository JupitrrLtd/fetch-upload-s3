 /* Created by
 * User: saintmac
 * Date: 22/10/13
 */

var init_tmp = require('./init_tmp'),
    download = require('./download'),
    S3Bucket = require('./bucket'),
    async = require('async'),
    fs = require('fs');


var FUS3 = function({
  s3_bucket_name,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION
}) {
  this.s3_bucket_name = s3_bucket_name;
  
AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION
});

};

FUS3.prototype.init = function(done) {
  if (this.s3_bucket_name) {
      var self = this;
      async.parallel([
          init_tmp,
          function(callback) {
              self.bucket = new S3Bucket(self.s3_bucket_name);
              self.bucket.exists(function(exists){
                  if (!exists) {
                      self.bucket.create(callback);
                  }
                  else {
                      callback();
                  }
              });
          }
      ], done);
  }
  else {
      init_tmp(done);
  }
};

FUS3.prototype.do = function (resource_to_fetch_url, s3_key, done) {
  var self = this;
  download(resource_to_fetch_url, s3_key, function(err){
    if (err) {
      return done(err);
    }
    var file_path = '/tmp/'+s3_key;
    self.bucket.upload(file_path, s3_key, function(err) {
      if (err) {
        return done(err);
      }
      else {
        fs.unlink(file_path, done);
      }
    });
  });
};

FUS3.prototype.uploadFile = function(absolutePath, s3_key, done) {
    this.bucket.upload(absolutePath, s3_key, function(err) {
        if (err) {
            return done(err);
        }
        else {
            fs.unlink(absolutePath, done);
        }
    });
};

FUS3.prototype.downloadFile = download;

module.exports = FUS3;


