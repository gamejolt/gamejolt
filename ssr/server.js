const fs = require('fs');
const process = require('process');
const path = require('path');
const express = require('express');
const { renderPreloadLinks } = require('./preload-links');

const isProd = process.env.NODE_ENV === 'production';
const projectRoot = path.resolve(__dirname, '..');

const buildDir = path.join(projectRoot, 'build');
const serverBuildPath = path.join(buildDir, 'ssr');
const webBuildPath = path.join(buildDir, 'web');

// If a promise is rejected and no error handler is attached, node will by
// default just die. We don't want that, otherwise all the other in-flight
// requests will die along with the one that triggered this. Generally, this
// isn't a problem for us since it's just async code that was triggered in some
// way in vue. As long as vue runs properly, we'll have the response that we can
// send.
process.on('unhandledRejection', (_reason, promise) => {
	console.error('Unhandled promise rejection at:', promise);
});

// This is the output of build:client. The server will render the vue app for
// incoming requests and interpolate it into the index.html before serving out.
const indexHtmlTemplate = fs.readFileSync(path.join(webBuildPath, 'index.html'), 'utf-8');

// The SSR manifest holds mappings of vue component => assets that are in use.
// Similarly to index.html and assets, it is generated with build:client (its
// the --ssrManifest flag) As the server renders the app, it keeps track of
// which components it rendered. We use this to figure out the smallest list of
// assets we need to preload on the client side in order to hydrate it.
const ssrManifest = require(path.join(webBuildPath, '.vite', 'ssr-manifest.json'));

// This is the output of build:server, evaluated once at startup and reused for
// every request. Per-request state isolation is handled by AsyncLocalStorage
// inside the bundle (see src/_common/ssr/createSsrHandler.ts), so a plain
// require is safe — no per-request module sandbox needed.
const renderRequest = require(path.join(serverBuildPath, 'server.cjs')).default;

const server = express();

// Only needed in dev builds, in prod everything would be served from cdn.
if (!isProd) {
	server.use(
		express.static(webBuildPath, {
			index: false,
		})
	);

	server.use('/favicon.ico', (req, res) => {
		res.status(404).end();
	});
}

server.use(async (req, res) => {
	try {
		const request = {
			url: req.url,
			ua: req.headers['user-agent'],
			accept: req.headers['accept'] || '',
		};

		console.log(request);

		const start = Date.now();
		const result = await renderRequest(request);

		if (result.redirect) {
			console.log('sending redirect', result.redirect);
			res.redirect(301, result.redirect);
			return;
		}

		// Vite's SSR manifest maps modules to the chunks/assets they live in;
		// we use the modules touched during render to emit just the preload
		// links this page needs.
		const preloadLinks = renderPreloadLinks(result.modules, ssrManifest);

		const html = indexHtmlTemplate
			.replace(`<!-- ssr-preload-links -->`, preloadLinks)
			.replace(`<!-- ssr-outlet -->`, result.html)
			.replace(`<!-- gj:ssr-metatags -->`, result.metaTagsHtml);

		if (result.errorCode) {
			console.log('sending error code', result.errorCode);
			res.status(result.errorCode);
		} else {
			res.status(200);
		}

		res.set({ 'Content-Type': 'text/html' }).end(html, () => {
			const total = Date.now() - start;
			console.log(
				'response ended',
				'total time:',
				total + 'ms',
				'render time:',
				total - result.prefetchTime + 'ms',
				req.url,
				req.headers['host'],
				req.headers['user-agent']
			);
		});
	} catch (e) {
		console.log('got error', req.url, e);
		res.status(500).end('Internal Server Error');
	}
});

const port = 3501;
server.listen(port, () => {
	console.log(`server started at localhost:${port}`);
});
