import vue, { Options as VueOptions } from '@vitejs/plugin-vue';
import { defineConfig, UserConfig as ViteUserConfigActual } from 'vite';
import md, { Mode as MarkdownMode } from 'vite-plugin-markdown';
import { acquirePrebuiltFFmpeg } from './scripts/build/desktop-app/ffmpeg-prebuilt';
import viteHtmlResolve from './scripts/build/vite-html-resolve';
import { readFromViteEnv } from './scripts/build/vite-runner';

const path = require('path') as typeof import('path');
const fs = require('fs-extra') as typeof import('fs-extra');

type ViteUserConfig = ViteUserConfigActual & {
	// This is an experimental feature, and as of time of writing
	// does not exists with the type definition the package exports.
	// They do work tho: https://vitejs.dev/guide/ssr.html#ssr-externals
	ssr?: {
		external?: (string | RegExp)[];
		noExternal?: (string | RegExp)[];
	};
};

type RollupOptions = Required<Required<ViteUserConfig>['build']>['rollupOptions'];

// https://vitejs.dev/config/
export default defineConfig(async () => {
	const gjOpts = readFromViteEnv(process.env);

	// When serving the client locally, we need to acquire the ffmpeg binaries.
	if (
		gjOpts.platform === 'desktop' &&
		(gjOpts.buildType === 'serve-hmr' || gjOpts.buildType === 'serve-build')
	) {
		await acquirePrebuiltFFmpeg({
			outDir: __dirname,
			cacheDir: path.resolve(__dirname, 'build', '.cache', 'ffmpeg-prebuilt'),
			nwjsVersion: gjOpts.nwjsVersion,
		});
	}

	// TODO(vite-no-devserver) we might need to rewrite package.json in the
	// project root if building the desktop app with build type serve-build as
	// such:
	// - remove node-remote key.
	// - change the main to be:
	//   chrome-extension://game-jolt-client/build/desktop/index.html#/

	type EmptyObject = { [k in any]: never };
	type GetValueOrEmpty = <T>(value: T) => T | EmptyObject;
	const emptyUnless = (condition: () => boolean): GetValueOrEmpty => {
		return value => {
			if (condition()) {
				return value;
			}
			return {};
		};
	};

	const onlyInSSR = emptyUnless(() => gjOpts.platform === 'ssr');
	const notInSSR = emptyUnless(() => gjOpts.platform !== 'ssr');
	const onlyInDesktopApp = emptyUnless(() => gjOpts.platform === 'desktop');

	// These will be imported in all styl files.
	const stylusOptions = {
		imports: [
			// Import the section variables.
			path.resolve(__dirname, `src/${gjOpts.section}/styles/variables.styl`),
			// Import common mixins.
			path.resolve(__dirname, 'src/_styles/mixins.styl'),
		],
	};

	const noopDirectiveTransform = () => ({ props: [] });

	const htmlResolver = viteHtmlResolve();

	// In order to do a full build of the frontend with all the sections
	// we need to build into the same directory. For index.html this is an issue
	// because the output filename is not hashed, so the different section's html
	// files will overwrite each other.
	// For this reason, simply rename index.html after the section name.
	// (app section remains index.html since it is our 'main' section. Purely semantics)
	const indexHtml = path.resolve(__dirname, 'src', 'index.html');
	let inputHtmlFile = indexHtml;
	if (gjOpts.buildType !== 'serve-hmr' && gjOpts.section !== 'app') {
		inputHtmlFile = path.resolve(indexHtml, '..', `${gjOpts.section}.html`);
		fs.copyFileSync(indexHtml, inputHtmlFile);
	}

	return {
		plugins: [
			// Does a simple string replace based interpolation in our html.
			//
			// I originally used vite-plugin-html here but for some reason
			// it only worked during build, but not during serve. Looks like Vite
			// tried parsing index.html before vite-plugin-html processed it, which
			// meant Vite was seeing invalid looking html and died.
			{
				name: 'gj:index-interpolations',
				enforce: 'pre',
				transformIndexHtml: {
					enforce: 'pre',
					transform: html => {
						// Patch our entrypoint depending on our section.
						html = html.replace(
							'<!-- gj:section-entrypoint -->',
							`<script type="module" src="/${gjOpts.section}/main.ts"></script>`
						);

						// Tell spider man to go back home.
						html = html.replace(
							'<!-- gj:crawlers -->',
							gjOpts.currentSectionConfig.allowCrawlers
								? ''
								: '<meta name="robots" content="noindex, nofollow" />'
						);

						// These are only set for app section.
						// Note: the <meta content> images are resolved using our viteHtmlResolve plugin.
						html = html.replace(
							'<!-- gj:app-section-shenanigans -->',
							gjOpts.section !== 'app'
								? ''
								: `
		<!-- Add to homescreen for Chrome on Android -->
		<meta name="mobile-web-app-capable" content="yes" />

		<!-- Add to homescreen for Safari on iOS -->
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<meta name="apple-mobile-web-app-title" content="Game Jolt" />
		<link
			rel="apple-touch-icon-precomposed"
			href="./app/img/touch/apple-touch-icon-precomposed.png"
		/>

		<!-- Tile icon for Win8 (144x144 + tile color) -->
		<meta
			name="msapplication-TileImage"
			content="./app/img/touch/ms-touch-icon-144x144-precomposed.png"
		/>
		<meta name="msapplication-TileColor" content="#191919" />`.trim()
						);

						html = html.replace(
							'<!-- gj:firebase-shenanigans -->',
							`
		<script>
			${fs.readFileSync(
				path.resolve(
					__dirname,
					'node_modules/first-input-delay/dist/first-input-delay.min.js'
				),
				{ encoding: 'utf-8' }
			)}
		</script>`.trim()
						);

						// Fallback title for the section in case it doesn't get set by the route.
						html = html.replace(
							'<!-- gj:section-title -->',
							`<title>${gjOpts.currentSectionConfig.title}</title>`
						);

						// Any additional scripts that need to be embedded for the section.
						html = html.replace(
							'<!-- gj:section-scripts -->',
							gjOpts.currentSectionConfig.jsScripts
						);

						const bodyClass = gjOpts.currentSectionConfig.htmlBodyClass;
						if (bodyClass) {
							html = html.replace(
								`<body id="root">`,
								`<body id="root" class="${bodyClass}">`
							);
						}

						return html;
					},
				},
			},

			// These images are used directly in the index.html but vite does not
			// resolve them. It seems it only looks at <img src>, <a href> and the likes, but not
			// all tags like <meta content>.
			//
			// This plugin basically injects the necessary <img src> and whatever to
			// make vite resolve them, and then returns what they resolved to.
			//
			// In the post plugin callback we use these resolved paths to do a simple
			// string replace to get em in.
			htmlResolver.prePlugin([
				'./app/img/meta-default-image.png',
				'./app/img/touch/ms-touch-icon-144x144-precomposed.png',
			]),
			htmlResolver.postPlugin((resolved, html) => {
				for (const entry of resolved.entries()) {
					const query = entry[0];
					const result = entry[1];

					html = html.replaceAll(query, result);
				}

				return html;
			}),

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
		],

		root: 'src',

		cacheDir: (() => {
			let dir = path.resolve(__dirname, 'node_modules') + path.sep;

			if (gjOpts.platform === 'web' || gjOpts.platform === 'ssr') {
				dir += '.vite';
			} else {
				dir += `.vite-${gjOpts.platform}`;
			}

			dir += `-${gjOpts.buildType}`;

			return dir;
		})(),

		base: (() => {
			// When watching simply return root.
			// This is a vite default.
			if (gjOpts.buildType === 'serve-hmr') {
				return '/';
			}

			// Desktop app assets are bundled into /package/ in prod,
			// and in dev they are build and watched into /build/desktop
			if (gjOpts.platform === 'desktop') {
				return gjOpts.buildType === 'serve-build' ? '/build/desktop/' : '/package/';
			}

			// Mobile app assets are expected to always resolve
			// from a relative path, so make sure to not root it.
			if (gjOpts.platform === 'mobile') {
				return '';
			}

			// In production builds we serve all assets from the cdn.
			// For desktop and mobile apps we serve from the locally bundled assets.
			if (gjOpts.environment === 'production' && gjOpts.buildType === 'build') {
				return 'https://s.gjcdn.net/';
			}

			// Return default, this is vite's default.
			return '/';
		})(),

		publicDir: 'static-assets',

		server: {
			strictPort: true,

			...((): Partial<ViteUserConfig['server']> => {
				// For both development and production environments we need to access the frontend
				// through https://development.gamejolt.com so we can access the cookies, local storage, etc.
				// We have different ways of achieving this for development and production.

				if (gjOpts.environment === 'production') {
					// When hitting production we expect to hit the devserver
					// from our browser directly, so we enable https using a self
					// signed certificate.
					return {
						// On mac I couldn't find a way to easily listen on port
						// 443 without root, so bind to port 8443, and forward
						// traffic from port 443 to 8443 in a separate process.
						// Example of using socat for that is in the README.md
						port: process.platform === 'darwin' ? 8443 : 443,

						https: {
							pfx: path.resolve(__dirname, 'development.gamejolt.com.pfx'),
							passphrase: 'yame yolt',
						},
					};
				} else {
					// The development configuration is a bit more involved. We
					// have multiple services that need to be accessible from
					// development.gamejolt.com and its subdomains. For this
					// reason we use a reverse proxy to do the routing and ssl
					// termination for us.
					//
					// When hitting https://development.gamejolt.com we'll be
					// hitting the reverse proxy first, and route traffic back
					// to the devserver as needed.
					return {
						// The reverse proxy will try to reach the devserver on port 8080.
						port: 8080,

						// Allows remote connections.
						//
						// This is needed to allow the reverse proxy to access
						// the devserver thats running on our host.
						//
						// TODO: this will bind the frontend to 0.0.0.0. find a
						// way to scope this down to an interface thats only
						// reachable locally.
						host: true,

						// The devserver runs locally on port 8080, but is
						// served from https://development.gamejolt.com. This
						// will cause requests to the HMR endpoint to get
						// blocked by the browser's security policy.
						hmr: {
							// Secure traffic is allowed only on port 443.
							// If we don't specify the port, vite will try
							// connecting to wss://development.gamejolt.com:8080
							clientPort: 443,

							// This is optional but makes it easier to differentiate
							// between issues with connecting to the HMR components
							// vs the serving component of vite's dev server.
							host: 'hmr.development.gamejolt.com',
						},
					};
				}
			})(),
		},

		build: {
			// Never inline stuff.
			assetsInlineLimit: 0,

			// Only minify in production so we can debug our stuff.
			minify: gjOpts.environment === 'production' && gjOpts.buildType === 'build',

			rollupOptions: {
				...(() => {
					// By default vite outputs filenames with their chunks, but
					// some ad blockers are outrageously aggressive with their
					// filter lists, for example blocking any file that contains
					// the string 'follow-widget'. It'd ridiculous. For this
					// reason, do not output filenames in prod web-based builds.
					if (
						gjOpts.environment === 'production' &&
						gjOpts.buildType === 'build' &&
						['web', 'ssr'].includes(gjOpts.platform)
					) {
						return <RollupOptions>{
							output: {
								chunkFileNames: 'assets/[hash].js',
								assetFileNames: 'assets/[hash].[ext]',
							},
						};
					}

					return {};
				})(),

				...notInSSR<RollupOptions>({
					// When building for ssr the entrypoint is specified in build.ssr,
					// and the index.html input file should NOT be specified.
					input: inputHtmlFile,
				}),

				...onlyInDesktopApp<RollupOptions>({
					external: ['client-voodoo'],
				}),
			},

			// Since we're building outside of the root dir,
			// we need to explicitly allow vite to clear the build directory.
			// This is needed to avoid accidentally referencing old assets
			// while developing
			emptyOutDir: gjOpts.emptyOutDir,

			// Write to build/{platform}.
			outDir: path.resolve(__dirname, path.join('build', gjOpts.platform)),

			// The SSR manifest is used to keep track of which static assets are
			// needed by which component. This lets us choose an optimal set of
			// assets that we should preload/prefetch when serving requests by looking
			// at which components ended up being rendered in said request.
			//
			// It is only useful to generate this when building the web frontend.
			//
			// We only build ssr for app section at the moment.
			ssrManifest: gjOpts.platform === 'web' && gjOpts.section === 'app',

			// This is the entry point of the ssr bundle.
			...onlyInSSR<Partial<ViteUserConfig['build']>>({
				ssr: path.join(gjOpts.section, 'server.ts'),
			}),
		},
		optimizeDeps: {
			exclude: ['client-voodoo'],
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

			GJ_SECTION: JSON.stringify(gjOpts.section),
			GJ_IS_DESKTOP_APP: JSON.stringify(gjOpts.platform === 'desktop'),
			GJ_IS_MOBILE_APP: JSON.stringify(gjOpts.platform === 'mobile'),
			GJ_ENVIRONMENT: JSON.stringify(gjOpts.environment),
			GJ_IS_STAGING: JSON.stringify(gjOpts.isStaging),
			GJ_BUILD_TYPE: JSON.stringify(gjOpts.buildType),
			GJ_VERSION: JSON.stringify(gjOpts.version),
			GJ_WITH_UPDATER: JSON.stringify(gjOpts.withUpdater),
			GJ_HAS_ROUTER: JSON.stringify(gjOpts.currentSectionConfig.hasRouter),
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
				],
			},
		}),
	};
});
