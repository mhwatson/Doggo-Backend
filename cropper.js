/* ----------------------------- Cropper -----------------------------
  Responsible for:
   Doing the math for the bounds of the doggo(s) and cropping to fit them.

  Returns null if:
   - features detected, but no doggos
   - no features detected

  Takes in:
   - originalImage (base64 image): The image that is getting transformed.
   - labeledImage (base64 image): The labels for the image.
   - label (string): the label that we are searching for.
*/

const sharp = require('sharp');

const header = 'Cropper Error:';

const error = {
  noDoggos: `${header} Could not detect any doggos.`,
  noFeatures: `${header} Could not detect any features.`,
}

const getDims = async (image) => {
	return await sharp(image).metadata();
}

// Captures multiple frendos
const Doggos = (instances, dims) => {
  return {
		x: {
			min: instances.reduce((a, b) => {
					return Math.min(a.BoundingBox.Left, b.BoundingBox.Left);
			}) * dims.width,
			max: instances.reduce((a, b) => {
					return Math.max(a.BoundingBox.Left + a.BoundingBox.Width, b.BoundingBox.Left + b.BoundingBox.Width);
			}) * dims.width,
		},
		y: {
			min: instances.reduce((a, b) => {
					return Math.min(a.BoundingBox.Top, b.BoundingBox.Top);
			}) * dims.height,
			max: instances.reduce((a, b) => {
					return Math.max(a.BoundingBox.Top + a.BoundingBox.Height, b.BoundingBox.Top + b.BoundingBox.Height);
			}) * dims.height,
		},
	}
}

// Captures solo frens
const Doggo = (instance, dims) => {
  const box = instance.BoundingBox;
  return {
		x: {
			min: box.Left * dims.width,
			max: (box.Left + box.Width) * dims.width,
		},
		y: {
			min: box.Top * dims.height,
			max: (box.Top + box.Height) * dims.height,
		},
	}
}

exports.cropper = async (originalImage, labeledImage, label) => {
	if (!(originalImage instanceof Buffer) || typeof labeledImage !== 'object' || typeof label !== 'string') {return null;}
	const dims = await getDims(originalImage);
	const dogs = labeledImage.Labels ? labeledImage.Labels.find(item => {
		return item.Name === label;
	}) : null;
	// If there is an error finding, or an empty array, just return a null (no crop)
	if (dogs === null || dogs == undefined) { 
		console.log(dogs === null ? error.noFeatures : error.noDoggos)
		return null;
	}
	const crop = dogs.Instances.length > 1 ? Doggos(dogs.Instances, dims) : Doggo(dogs.Instances[0], dims)
	const cropped = await sharp(originalImage)
		.extract({
			left: Math.floor(crop.x.min),
			top: Math.floor(crop.y.min),
			width: Math.ceil(crop.x.max - crop.x.min),
			height: Math.ceil(crop.y.max - crop.y.min),
		})
		.toBuffer();
	return cropped;
}