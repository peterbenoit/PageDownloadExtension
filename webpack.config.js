const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
	devtool: process.env.NODE_ENV === 'production' ? false : 'cheap-module-source-map',
	entry: {
		background: './src/background/background-wrapper.js',
		content: './src/content/content-wrapper.js',
		popup: './src/popup/popup-wrapper.js',
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].js',
		clean: true,
	},
	resolve: {
		extensions: ['.js', '.json']
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: 'babel-loader'
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			},
		],
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{ from: './src/manifest/manifest.json', to: 'manifest.json' },
				{ from: './icons', to: 'icons' },
				{ from: './src/lib/jszip.min.js', to: 'jszip.min.js' }
			],
		}),
		new HtmlWebpackPlugin({
			template: './src/popup/popup.html',
			filename: 'popup.html',
			chunks: ['popup']
		})
	],
	optimization: {
		minimize: process.env.NODE_ENV === 'production',
	},
}
