// Top-level folders under src/ that represent an independently-built section.
// Each has its own main.ts entrypoint and should not reach into another section.
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

// Top-level folders under src/ that are shared by all sections. These must not
// import from any section — doing so creates a cycle where shared code depends
// on the section that's supposed to consume it.
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
			group: forbiddenAliases.flatMap(a => [a, `${a}/*`]),
			message: `${label} cannot import from other sections. Use ~common, ~styles, ~utils, or ~lib for shared code.`,
		});
	}
	return ['error', { patterns }];
}

module.exports = {
	parser: 'vue-eslint-parser',
	parserOptions: {
		parser: '@typescript-eslint/parser',
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'simple-import-sort'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:vue/vue3-recommended',
	],
	reportUnusedDisableDirectives: true,
	rules: {
		'no-empty': ['error', { allowEmptyCatch: true }],
		'no-undef': 'off',
		'no-unused-vars': 'off',
		'no-mixed-spaces-and-tabs': 'off',
		'getter-return': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/no-unsafe-assignment': 'off',
		'@typescript-eslint/no-unsafe-call': 'off',
		'@typescript-eslint/no-unsafe-member-access': 'off',
		'@typescript-eslint/no-unsafe-return': 'off',
		'@typescript-eslint/no-unused-vars': 'off',
		'@typescript-eslint/no-var-requires': 'off',
		'vue/no-mutating-props': ['error', { shallowOnly: true }],
		'vue/no-v-html': 'off',
		'vue/component-tags-order': [
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
	overrides: [
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
	],
};
