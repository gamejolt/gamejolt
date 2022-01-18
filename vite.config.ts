import vue, { Options as VueOptions } from '@vitejs/plugin-vue';
import * as path from 'path';
import { defineConfig, UserConfig as ViteUserConfigActual } from 'vite';
import { injectHtml } from 'vite-plugin-html';
import md, { Mode as MarkdownMode } from 'vite-plugin-markdown';

type ViteUserConfig = ViteUserConfigActual & {
	// This is an experimental feature, and as of time of writing
	// does not exists with the type definition the package exports.
	// They do work tho: https://vitejs.dev/guide/ssr.html#ssr-externals
	ssr?: {
		external?: (string | RegExp)[];
		noExternal?: (string | RegExp)[];
	};
};

const ssr = !!process.env.SSR;

type EmptyObject = { [k in any]: never };

const onlyInSSR = <T>(value: T): T | EmptyObject => {
	if (ssr) {
		return value;
	}

	return {};
};

const gjSection = process.env['GJSECTION'] || 'app';

const noopDirectiveTransform = () => ({ props: [] });

const stylusOptions = {
	imports: [
		// Import the section variables.
		path.resolve(__dirname, 'src/app/styles/variables.styl'),
		// Import common mixins.
		path.resolve(__dirname, 'src/_styles/mixins.styl'),
	],
};

// TODO(vue3): we need a way to remove client-related code completely

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue({
			...onlyInSSR<Partial<VueOptions>>({
				template: {
					compilerOptions: {
						// For all directives, we have to transform them when used
						// in SSR. We usually just want to not process during SSR
						// since directives are usually for dynamic work.
						directiveTransforms: Object.fromEntries(
							[
								'translate',
								'app-tooltip',
								'app-track-event',
								'app-auth-required',
								'app-form-autosize',
								'app-focus-when',
								'app-observe-dimensions',
								'app-no-autoscroll',
								'app-scroll-to',
								'app-tooltip',
							].map(k => [k, noopDirectiveTransform])
						),
					},
				},
			}),
		}),
		md({
			mode: [MarkdownMode.HTML],
		}),
		// Lets us use <%- %> syntax to interpolate data statically into the output HTML.
		injectHtml({ data: { GJ_SECTION: gjSection } }),
	],
	root: 'src',
	server: {
		port: 8080,
	},
	build: {
		// Since we're building outside of the root dir,
		// we need to explicitly allow vite to clear the build directory.
		// This is needed to avoid accidentally referencing old assets
		// while developing
		emptyOutDir: true,

		// Write to build/web normally and to build/server for ssr.
		outDir: path.resolve(
			__dirname,
			ssr ? path.join('build', 'server') : path.join('build', 'web')
		),

		// The SSR manifest is used to keep track of which static assets are
		// needed by which component. This lets us choose an optimal set of
		// assets that we should preload/prefetch when serving requests by looking
		// at which components ended up being rendered in said request.
		ssrManifest: !ssr,

		// This is the entry point of the ssr bundle.
		...onlyInSSR<Partial<ViteUserConfig['build']>>({
			ssr: path.join(gjSection, 'server.ts'),
		}),
	},
	resolve: {
		alias: {
			// Lets us use ~img in our css imports so we don't
			// have to meme around with relative paths.
			// e.g. we can use import(`~img/favicon.png`) to get the favicon
			// asset no matter where we call it from.
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
		// These are statically replaced in the source code at build/watch time.
		// Since this is a straightforward string replacement these need to be quoted.
		// For example, if we didn't quote, the following expression:
		//   if (GJ_ENVIRONMENT === 'development')
		// would be rewritten to:
		//   if (development === 'development')

		GJ_SECTION: JSON.stringify(gjSection),
		GJ_IS_DESKTOP_APP: JSON.stringify(false),
		GJ_IS_MOBILE_APP: JSON.stringify(false),
		GJ_ENVIRONMENT: JSON.stringify('production'),
		GJ_BUILD_TYPE: JSON.stringify('development'),
		GJ_VERSION: JSON.stringify('0.1.0'),
		GJ_WITH_UPDATER: JSON.stringify(false),
	},

	...onlyInSSR<ViteUserConfig>({
		// Vite tries figuring out which package is CommonJS.
		// These packages may be left as simple "require" to speed up building,
		// while other types need to be transformed/transpiled into the server
		// bundle.
		//
		// Sometimes Vite can't properly detect the type of a package.
		// Putting it in `external` tells Vite to leave it as a simple require,
		// and putting it in `noExternal` tells Vite to pull it into the bundle.
		//
		// More info: https://vitejs.dev/guide/ssr.html#ssr-externals
		ssr: {
			noExternal: [
				// These modules for whatever reason don't work being
				// required server-side directly and must be bundled into
				// the build.
				/^@popperjs/,
				'@ckpack/vue-color',
				'prosemirror-keymap',

				// TODO: this is not a real solution, we shouldn't be requiring this.
				// Need to rethink how we do async code loading so we can split things
				// better for ssr.
				'client-voodoo',
			],
		},
	}),
});
