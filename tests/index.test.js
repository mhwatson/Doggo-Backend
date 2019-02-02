
const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const fs = require('fs');
const AWS = require('aws-sdk');
const handler = require('../index').handler;

// Note: This will write to S3 and use Rekognition unless stubbed.
describe("Lambda function", () => {
  it("Should work if no local parameter is passed", () => {
    const img = fs.readFileSync('./assets/test4.jpg', 'base64');
    handler({img});
  });
  it("Should work if local parameter is passed", () => {
    const img = fs.readFileSync('./assets/test4.jpg', 'base64');
    handler({img}, true);
  });
  it("Should skip posting if no doggos", () => {
    const img = fs.readFileSync('./assets/noDoggos_test2.jpg', 'base64');
    handler({img}, true);
  });
});