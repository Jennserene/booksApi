export default {
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
    "**/*.{js}",
    "!**/*.test.js",
    "!coverage/**",
    "!**/*.config.js"
  ],
	coverageReporters: ['text'],
	coverageThreshold: {
		global: {
			branches: 80,
			statements: 80,
		},
	},
}