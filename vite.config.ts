import vue from '@vitejs/plugin-vue';
import * as path from 'path';
import { defineConfig } from 'vite';
import md, { Mode as MarkdownMode } from 'vite-plugin-markdown';

const noopDirectiveTransform = () => ({ props: [] });

const stylusOptions = {
	imports: [
		// Import the section variables.
		path.resolve(__dirname, 'src/app/styles/variables.styl'),
		// Import common mixins.
		path.resolve(__dirname, 'src/_styles/mixins.styl'),
	],
	// TODO(vue3): does this work?
	url: true,
	css: true,
};

// TODO(vue3): we need a way to remove client-related code completely

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue({
			// template: {
			// 	compilerOptions: {
			// 		// For all directives, we have to transform them when used
			// 		// in SSR. We usually just want to not process during SSR
			// 		// since directives are usually for dynamic work.
			// 		directiveTransforms: {
			// 			translate: noopDirectiveTransform,
			// 		},
			// 	},
			// },
		}),
		md({
			mode: [MarkdownMode.HTML],
		}),
	],
	root: 'src',
	server: {
		port: 8080,
	},
	resolve: {
		alias: {
			'~img': path.resolve(__dirname, 'src/app/img'),
		},
	},
	css: {
		preprocessorOptions: {
			// It seems that our stylus blocks in .vue files are the "stylus"
			// one and then any imports where the filename ends in .styl is the
			// "styl" one. So yeah, we need both.
			stylus: stylusOptions,
			styl: stylusOptions,
		},
	},
	define: {
		GJ_SECTION: JSON.stringify('auth'),
		GJ_IS_DESKTOP_APP: JSON.stringify(false),
		GJ_ENVIRONMENT: JSON.stringify('production'),
		GJ_BUILD_TYPE: JSON.stringify('development'),
		GJ_VERSION: JSON.stringify('0.1.0'),
		GJ_WITH_UPDATER: JSON.stringify(false),
	},

	// I guess this is still experimental or something, so they don't include it
	// in the config typing?
	ssr: {
		noExternal: [
			// These modules for whatever reason don't work being
			// required server-side directly and must be bundled into
			// the build.
			/^@popperjs/,
		],
	},
});
