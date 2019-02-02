const uuidv4 = require('uuid/v4');
const pg = require('pg');
const sharp = require('sharp');
const AWS = require('aws-sdk');
const sizer = require('./sizer').sizer;
const cropper = require('./cropper').cropper;
AWS.config.update({region:'us-east-1'});
const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();

const s3Config = {
	BUCKETNAME: 'doggo.world.pictures',
	BUCKETPATH: 'https://s3.us-east-2.amazonaws.com/doggo.world.pictures/',
}

const dbConfig = {
  user: 'doggoadmin',
  password: 'DoggoWorld',
  database: 'doggoworld',
  host: 'doggoworlddev.cqpsvqqdgzhb.us-east-1.rds.amazonaws.com',
  port: 5432
};

const sizes = ['small', 'medium', 'large', 'full'];

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
	}
}

// Need to compare cover vs contain. 

const getLabels = async (image) => {
	var params = {
	  Image: {
	    Bytes: image,
	  },
	  MaxLabels: 10,
	  MinConfidence: 30.0
	};
	const res = await rekognition.detectLabels(params, (err, data) => {
	  if (err) {
	  	console.log(err, err.stack);
	  	return null;
	  }
	  else {
	  	return data;
	  }
	}).promise();
	return res;
}

const resizeAll = async (image) => {
	const resized = {
		small: await sizer(image, dimens.small),
		medium: await sizer(image, dimens.medium),
		large: await sizer(image, dimens.large),
		full: await sizer(image, dimens.full)
	}
	return resized;
}

exports.handler = async (event, local = false) => {
  const originalImage = Buffer.from(event.img, 'base64');

	const labeledImage = await getLabels(originalImage);

	const croppedImage = await cropper(originalImage, labeledImage, 'Dog');
	// If no dogs found, skip the adding process
	if (croppedImage !== null) {
		const image = await resizeAll(croppedImage);

		if (local) {
			sizes.map((size) => {
				image[size].toFile(`output-${size}.jpg`);
			})
		} else {
			/* Start of Kaspar's old crap */
			const uuid = uuidv4();

			const params = sizes.map((size) => {
				return {
					Body: image[size],
					Bucket: s3Config.BUCKETNAME,
					Key: `${size}/${uuid}.jpg`
				}
			});

			const posts = params.map((param) => {
				return new Promise(resolve => {
					s3.upload(param, function(err, data) {
						if (err) {
							console.log({ err });
							resolve();
						} else {
							console.log({ data });
							resolve();
						}
					});
				})
			});

			await Promise.all(posts);

			const QUERY = `INSERT INTO public.pictures
				(uuid, src_sm, src_md, src_lg, src_full, votes, date_created) VALUES
				('${uuid}',
				'${s3Config.BUCKETPATH + "small/" + uuid + ".jpg"}',
				'${s3Config.BUCKETPATH + "medium/" + uuid + ".jpg"}',
				'${s3Config.BUCKETPATH + "large/" + uuid + ".jpg"}',
				'${s3Config.BUCKETPATH + "full/" + uuid + ".jpg"}',
				0,
				NOW())`;

			const client = new pg.Client(dbConfig);
			await client.connect();
			await client.query(QUERY);
			await client.end();
			
			/* End of Kaspar's old crap */
		}
	}
};
