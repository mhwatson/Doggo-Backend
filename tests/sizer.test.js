
const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const sizer = require('../sizer').sizer;
const fs = require('fs');

const img = fs.readFileSync('./assets/test4.jpg', 'base64');

const dimens = {
	small: {
		height: 240,
		width: 320,
	},
	medium: {
		height: 480,
		width: 640,
	},
	large: {
		height: 960,
		width: 1280,
	},
	full: {
		height: null,
		width: null,
  },
  fake: {
    words: 'foo'
  }
};

const image = Buffer.from(img, 'base64');

describe("Sizer function", () => {
  it("Takes (at least) 2 parameters, else return null", async () => {
    let res = await sizer(null, null);
    expect(res).to.be.null;
    res = await sizer(null, dimens.small);
    expect(res).to.be.null;
    res = await sizer(image, null);
    expect(res).to.be.null;
    res = await sizer(null, dimens.small);
    expect(res).to.be.null;
  });
  it("Should fail gracefully if a bad version is passed", async () => {
    let spy = sinon.stub(console, 'log');
    let res = await sizer(image, dimens.small, 2);
    expect(res).to.be.null;
    expect(spy.calledWith('Sizer Error: We haven\'t specified that version yet!')).to.be.true;
    spy.restore();
  });
  it("Should fail gracefully if bad dimensions are passed", async () => {
    let spy = sinon.stub(console, 'log');
    let res = await sizer(image, dimens.fake);
    console.log(res)
    expect(res).to.be.null;
    expect(spy.calledWith('Sizer Error: Invalid dimensions have been passed to the sizer.')).to.be.true;
    spy.restore();
  });
  it("Should handle full dimensions", async () => {
    const res = await sizer(image, dimens.full);
    expect(typeof res === 'object').to.be.true;
  });
  it("Should handle specific dimensions", async () => {
    let res = await sizer(image, dimens.small);
    expect(typeof res === 'object').to.be.true;
    res = await sizer(image, dimens.medium);
    expect(typeof res === 'object').to.be.true;
    res = await sizer(image, dimens.large);
    expect(typeof res === 'object').to.be.true;
  });
});