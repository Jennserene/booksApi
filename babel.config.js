module.exports = {
	presets: [
		[
			'@babel/env',
			{
				useBuiltIns: 'usage',
				corejs: '3.9.0',
			},
		],
	],
	plugins: [
		'@babel/proposal-class-properties',
		'@babel/proposal-optional-chaining',
		'@babel/proposal-private-methods',
		'@babel/transform-modules-commonjs',
	],
}