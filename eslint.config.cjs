const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const pluginVue = require('eslint-plugin-vue');
const simpleImportSort = require('eslint-plugin-simple-import-sort');
const vueParser = require('vue-eslint-parser');

const SECTIONS = [
	'app',
	'auth',
	'checkout',
	'claim',
	'client',
	'editor',
	'gameserver',
	'site-editor',
	'widget-package',
	'z',
];

const GLOBAL_DIRS = ['_common', '_styles', '_img', 'utils', 'lib'];

const sectionAliases = SECTIONS.map(s => `~${s}`);

function restrictedImportsRule(forbiddenAliases, label) {
	const patterns = [
		{
			group: ['../*'],
			message:
				'Use ~section aliases (~app, ~common, ~styles, etc.) instead of ../ relative imports.',
		},
	];
	if (forbiddenAliases.length > 0) {
		patterns.push({
			// Forbid any import from another section's alias, except files
			// ending in `.route` — those are the public route surface
			// (route records + URL builders) and must stay stateless.
			//
			// ESLint's no-restricted-imports uses the `ignore` package
			// (gitignore-style). Gitignore has a quirk where re-including a
			// file doesn't work if a parent directory is excluded. The
			// `!${a}/**/` rule re-includes the directory entries so the
			// `.route` file re-inclusion can apply.
			group: forbiddenAliases.flatMap(a => [`${a}/**`, `!${a}/**/`, `!${a}/**/*.route`]),
			message: `${label} cannot import from other sections. Use ~common, ~styles, ~utils, or ~lib for shared code. (.route files are exempt.)`,
		});
	}
	return ['error', { patterns }];
}

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
			'no-useless-assignment': 'off',
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
			'no-restricted-imports': restrictedImportsRule([], ''),
		},
	},
	// Each section may only reach into its own code plus the global dirs
	// (~common, ~styles, ~utils, ~lib). Other section aliases are banned.
	...SECTIONS.map(section => ({
		files: [`src/${section}/**/*`],
		rules: {
			'no-restricted-imports': restrictedImportsRule(
				sectionAliases.filter(a => a !== `~${section}`),
				`Section '${section}'`
			),
		},
	})),
	// Global dirs must not depend on any section.
	...GLOBAL_DIRS.map(dir => ({
		files: [`src/${dir}/**/*`],
		rules: {
			'no-restricted-imports': restrictedImportsRule(sectionAliases, `Global '${dir}'`),
		},
	})),
];
