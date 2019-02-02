
const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const cropper = require('../cropper').cropper;
const fs = require('fs');

const img = fs.readFileSync('./assets/test4.jpg', 'base64');

const labels = ["Dog", "Anything"];

const labeledImages = {
  withDog: {
    "Labels": [
      {
        "Name": "Dog",
        "Confidence": 97.863166809082,
        "Instances": [
          {
            "BoundingBox": {
              "Width": 0.44774466753006,
              "Height": 0.62985616922379,
              "Left": 0.018286561593413,
              "Top": 0.36564841866493
            },
            "Confidence": 97.863166809082
          }
        ],
        "Parents": [
          {
            "Name": "Pet"
          },
          {
            "Name": "Animal"
          },
          {
            "Name": "Canine"
          },
          {
            "Name": "Mammal"
          }
        ]
      }
    ],
    "LabelModelVersion": "2.0"
  },
  withDogs: {
    "Labels": [
      {
        "Name": "Dog",
        "Confidence": 98.12247467041,
        "Instances": [
          {
            "BoundingBox": {
              "Width": 0.5609170794487,
              "Height": 0.53351193666458,
              "Left": 0.13979358971119,
              "Top": 0.24041691422462
            },
            "Confidence": 98.12247467041
          },
          {
            "BoundingBox": {
              "Width": 0.66236519813538,
              "Height": 0.38034245371819,
              "Left": 0.33139529824257,
              "Top": 0.40802016854286
            },
            "Confidence": 88.643981933594
          }
        ],
        "Parents": [
          {
            "Name": "Mammal"
          },
          {
            "Name": "Pet"
          },
          {
            "Name": "Animal"
          },
          {
            "Name": "Canine"
          }
        ]
      }
    ],
    "LabelModelVersion": "2.0"
  },
  noDog: {
    "Labels": [
      {
        "Name": "Strap",
        "Confidence": 99.744758605957,
        "Instances": [
          
        ],
        "Parents": [
          
        ]
      }
    ],
    "LabelModelVersion": "2.0"
  },
  noLabels: {
    "Labels": [],
    "LabelModelVersion": "2.0"
  },
  empty: {}
}

const image = Buffer.from(img, 'base64');

describe("Cropper function", () => {
  it("Must take 3 parameters, else return null", async () => {
    let res = await cropper(null, null, null);
    expect(res).to.be.null;
    res = await cropper(null, null, labels[0]);
    expect(res).to.be.null;
    res = await cropper(null, labeledImages.noLabels, null);
    expect(res).to.be.null;
    res = await cropper(image, null, null);
    expect(res).to.be.null;
    res = await cropper(null, labeledImages.noLabels, labels[0]);
    expect(res).to.be.null;
    res = await cropper(image, labeledImages.noLabels, null);
    expect(res).to.be.null;
    res = await cropper(image, true, labels[0]);
    expect(res).to.be.null;
  });
  it("Should fail gracefully if there is an issue with the label API", async () => {
    let spy = sinon.stub(console, 'log');
    let res = await cropper(image, labeledImages.empty, labels[0]);
    expect(res).to.be.null;
    expect(spy.calledWith('Cropper Error: Could not detect any features.')).to.be.true;
    spy.restore();
  });
  it("Should handle there not being any doggos in the image", async () => {
    let spy = sinon.stub(console, 'log');
    const res = await cropper(image, labeledImages.noDog, labels[0]);
    expect(res).to.be.null;
    expect(spy.calledWith('Cropper Error: Could not detect any doggos.')).to.be.true;
    spy.restore();
  });
  it("Should handle solo doggos", async () => {
    const res = await cropper(image, labeledImages.withDog, labels[0]);
    expect(res instanceof Buffer).to.be.true;
  });
  it("Should handle multi doggos", async () => {
    const res = await cropper(image, labeledImages.withDogs, labels[0]);
    expect(res instanceof Buffer).to.be.true;
  });
});