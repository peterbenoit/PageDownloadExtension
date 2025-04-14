const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
	entry: {
		background: './src/background/index.js',
		content: './src/content/index.js',
		popup: './src/popup/popup.js'
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
		clean: true
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			}
		]
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{ from: "manifest.json", to: "manifest.json" },
				{ from: "WORKING_VERSION/popup.html", to: "popup.html" },
				{ from: "icons", to: "icons", noErrorOnMissing: true }
			],
		}),
	],
	performance: {
		hints: false
	}
};
