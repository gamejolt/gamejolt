const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const pluginVue = require('eslint-plugin-vue');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const vueParser = require('vue-eslint-parser');

module.exports = [
	{
		ignores: ['build/**', 'node_modules/**', '**/*.d.ts'],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	...pluginVue.configs['flat/recommended'],
	{
		files: ['**/*.{js,ts,vue}'],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: tseslint.parser,
				sourceType: 'module',
				ecmaVersion: 'latest',
			},
		},
		plugins: {
			'simple-import-sort': simpleImportSort,
		},
		linterOptions: {
			reportUnusedDisableDirectives: true,
		},
		rules: {
			'no-empty': ['error', { allowEmptyCatch: true }],
			'no-undef': 'off',
			'no-unused-vars': 'off',
			'no-mixed-spaces-and-tabs': 'off',
			'getter-return': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-empty-function': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-var-requires': 'off',
			'@typescript-eslint/no-require-imports': 'off',
			'@typescript-eslint/no-unused-expressions': 'off',
			'@typescript-eslint/no-wrapper-object-types': 'off',
			'@typescript-eslint/no-unsafe-function-type': 'off',
			'vue/no-mutating-props': ['error', { shallowOnly: true }],
			'vue/no-v-html': 'off',
			'vue/require-default-prop': 'off',
			'vue/block-order': [
				'warn',
				{
					order: ['script', 'template', 'style'],
				},
			],
			'vue/html-indent': 'off',
			'vue/html-closing-bracket-newline': 'off',
			'vue/html-self-closing': [
				'warn',
				{
					html: {
						void: 'always',
						normal: 'always',
						component: 'always',
					},
					svg: 'always',
					math: 'always',
				},
			],
			'vue/max-attributes-per-line': 'off',
			'vue/singleline-html-element-content-newline': 'off',
			'vue/return-in-computed-property': 'off',
			'simple-import-sort/imports': 'warn',
			'simple-import-sort/exports': 'warn',
		},
	},
	{
		files: ['src/**/*'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: ['../*'],
							message:
								'Use ~section aliases (~app, ~common, ~styles, etc.) instead of ../ relative imports.',
						},
					],
				},
			],
		},
	},
];
