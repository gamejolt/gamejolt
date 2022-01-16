import vue, { Options as VueOptions } from '@vitejs/plugin-vue';
import * as path from 'path';
import { defineConfig, UserConfig as ViteUserConfig } from 'vite';
import { injectHtml } from 'vite-plugin-html';
import md, { Mode as MarkdownMode } from 'vite-plugin-markdown';

const ssr = !!process.env.SSR;

type EmptyObject = { [k in any]: never };

const onlyInSSR = <T>(value: T): T | EmptyObject => {
	if (ssr) {
		return value;
	}

	return {};
};

const onlyInSSRArray = <T>(value: T[]): T[] => {
	if (ssr) {
		return value;
	}

	return [];
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
		injectHtml({ data: { GJ_SECTION: gjSection } }),
	],
	root: 'src',
	server: {
		port: 8080,
	},
	build: {
		emptyOutDir: true,
		...onlyInSSR<Partial<ViteUserConfig['build']>>({
			ssr: path.join(gjSection, 'server.ts'),
		}),
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
		GJ_SECTION: JSON.stringify(gjSection),
		GJ_IS_DESKTOP_APP: JSON.stringify(false),
		GJ_IS_MOBILE_APP: JSON.stringify(false),
		GJ_ENVIRONMENT: JSON.stringify('production'),
		GJ_BUILD_TYPE: JSON.stringify('development'),
		GJ_VERSION: JSON.stringify('0.1.0'),
		GJ_WITH_UPDATER: JSON.stringify(false),
	},

	...onlyInSSR<ViteUserConfig>({
		// I guess this is still experimental or something, so they don't include it
		// in the config typing?
		ssr: {
			// external: ['agora-rtc-sdk-ng'],
			noExternal: [
				// /^firebase/,

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
