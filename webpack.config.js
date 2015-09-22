var path = require('path');
module.exports = {
	entry: './src/index.js',
	output: {
		path: path.join(__dirname, 'public'),
		filename:'bundle.js'
	},
	module: {
		loaders: [
			{ test: /\.glsl$/, loader: 'shader' }
		]
	}
}
