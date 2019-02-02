/* ----------------------------- Sizer -----------------------------
  Responsible for:
   Taking an image and scaling it to the appropriate sizes.

  Returns null if:
   - image size is invalid
   - unspecified version has been passed

  Takes in:
   - image (base64 image): The image that is getting transformed.
   - dimens (object): a width and a height (in pixels).
   - version (int): the version of the sizer that is being used.
     Only running with v1 right now.
*/

const sharp = require('sharp');

const header = 'Sizer Error:';

const error = {
  version: `${header} We haven\'t specified that version yet!`,
  dimens: `${header} Invalid dimensions have been passed to the sizer.`
}

const v1 = async (image, dimens) => {
  if (dimens.width === null && dimens.height === null) {
    const img = await sharp(image)
      .jpeg()
    return img;
  }
  const img = await sharp(image)
    .resize({...dimens, fit: 'contain'})
    .jpeg()
  return img;
};

exports.sizer = async (image, dimens, version = 1) => {
  if (!(image instanceof Buffer)) {return null;}
  if (version !== 1) {
    console.log(error.version);
    return null;
  }
  if (dimens === null || dimens.width === undefined || dimens.height === undefined) {
    console.log(error.dimens);
    return null;
  }
  return await v1(image, dimens);
};