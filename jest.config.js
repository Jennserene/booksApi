module.exports = {
	clearMocks: true,
	moduleFileExtensions: ['js', 'json'],
	transform: {
		// '.+\\.(css|scss|png|jpg|woff|woff2)': 'jest-transform-stub',
		'^.+\\.jsx?$': 'babel-jest',
	},
	transformIgnorePatterns: ['/node_modules/'],
	testMatch: ['**/*.test.js'],
	testURL: 'http://localhost/',
	collectCoverage: true,
	collectCoverageFrom: [
		'src/**/*.{js}',
		'!**/*.spec.po.js',
		'!coverage/**',
		'!**/*.config.js',
		'!**/dist/**',
	],
	coverageReporters: ['text'],
	coverageThreshold: {
		global: {
			branches: 80,
			statements: 80,
		},
	},
}