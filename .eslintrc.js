module.exports = {
	plugins: ['@typescript-eslint'],
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
	root: true,

	env: {
		es2023: true,
		browser: false,
		node: false,
	},

	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: ['./tsconfig.json'],
		ecmaVersion: 'latest',
		sourceType: 'script',
		impliedStrict: 'true',
	},

	ignorePatterns: ['.eslintrc.js', 'node_modules', '.jsbuild/', '**/*.d.ts'],

	rules: {
		'quotes': ['error', 'single', { avoidEscape: true }],
		'prefer-const': ['error'],
		'no-empty': ['error', { allowEmptyCatch: true }],
		'class-methods-use-this': ['error'],
		'camelcase': ['warn'],
		'eqeqeq': ['error', 'smart'],
		'no-var': ['error'],
		'no-useless-constructor': ['error'],
		'no-unused-expressions': ['error', { allowTernary: true }],
		'prefer-arrow-callback': ['error'],

		'strict': ['off'],
		'no-undef': ['off'],
		'no-unused-vars': ['off'],
		'@typescript-eslint/no-unused-vars': ['off'],
	}
};
