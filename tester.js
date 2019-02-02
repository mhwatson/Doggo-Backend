const handler = require('./index').handler;
const fs = require('fs');

handler(
	{ img: fs.readFileSync('./assets/twoDoggos_test1.jpg', 'base64') },
	true // always runs locally
)