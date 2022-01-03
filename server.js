const argv = require('minimist')(process.argv);
const fs = require('fs-extra');
const path = require('path');
const http = require('http');
const express = require('express');
const cluster = require('cluster');

// We will restart each worker after around this many requests.
const RestartRequestCount = 250;

function resolve(file) {
	return path.resolve(__dirname, file);
}

const numWorkers = require('os').cpus().length;
const isProd = process.env.NODE_ENV === 'production' || argv.production;
const buildDir = process.env.BUNDLE_DIR || resolve('build');

// if (cluster.isMaster) {
// 	console.log(`Master ${process.pid} is running`);

// 	// Fork workers.
// 	for (let i = 0; i < numWorkers; i++) {
// 		cluster.fork();
// 	}

// 	cluster.on('exit', (worker, code, signal) => {
// 		console.log(`worker ${worker.process.pid} died`);
// 		cluster.fork();
// 	});
// } else {
const { renderToString } = require('vue/server-renderer');

console.log(`Worker ${process.pid} started`);

const section = argv.section ?? 'app';
// const serverBuildPath = path.join(buildDir, isProd ? 'prod-server' : 'dev-server');
// const clientBuildPath = path.join(buildDir, isProd ? 'prod' : 'dev');
const serverBuildPath = path.join(buildDir, 'server');
const webBuildPath = path.join(buildDir, 'web');

// const serverManifest = require(path.join(
// 	serverBuildPath,
// 	'vue-ssr-server-manifest-' + section + '.json'
// ));
// console.log('server manifest', serverManifest);
// const clientManifest = require(path.join(
// 	clientBuildPath,
// 	'vue-ssr-client-manifest-' + section + '.json'
// ));

// const entryFile = fs.readdirSync(serverBuildPath).find(i => i.startsWith(`${section}.server.`));
// if (!entryFile) {
// 	throw new Error(`Couldn't find the entry file for the app.`);
// }
// const appPath = path.resolve(serverBuildPath, entryFile);
// const createApp = require(appPath).GJ.default;

const rawTemplate = fs.readFileSync(path.resolve(webBuildPath, 'index.html'), 'utf-8');
console.log(rawTemplate);

const createApp = require(path.resolve(serverBuildPath, 'server.js')).default;

const server = express();

// const vite = await createViteServer({
// 	server: { middlewareMode: 'ssr' },
// });

// server.use(vite.middlewares);

// const renderer = createBundleRenderer(serverBundle, {
// 	runInNewContext: true,
// 	template: fs.readFileSync(resolve('./index-ssr.html'), 'utf-8'),
// 	clientManifest,
// 	shouldPrefetch: () => false,
// 	shouldPreload: () => false,
// });

// If testing ssr prod build locally, remove this if so that static assets are
// served properly.
if (!isProd) {
	// eslint-disable-next-line no-inner-declarations
	function serve(path) {
		return express.static(resolve(path), {
			maxAge: 0,
			fallthrough: true,
			index: false,
			// maxAge: cache && isProd ? 60 * 60 * 24 * 30 : 0
		});
	}

	server.use(serve(webBuildPath));
}

// Randomize so we don't all restart at same time.
const numRequestsToRestartAt =
	RestartRequestCount + Math.floor(Math.random() * (RestartRequestCount / 15));

console.log('Worker will restart in', numRequestsToRestartAt, 'requests');

let numRequests = 0;
server.get('*', async (req, res) => {
	const context = {
		url: req.url,
		ua: req.headers['user-agent'],
		accept: req.headers['accept'] || '',
	};
	let template = rawTemplate;

	try {
		const s = Date.now();

		console.log('context', context);

		// Apply Vite HTML transforms. This injects the Vite HMR client, and also
		// applies HTML transforms from Vite plugins, e.g. global preambles from
		// @vitejs/plugin-react
		// template = await vite.transformIndexHtml(context.url, template);

		// Load the server entry file.
		// const { render } = await vite.ssrLoadModule('/src/auth/server.ts');

		// const appContent = await render(context.url);
		// const html = template.replace(`<!--ssr-outlet-->`, appContent);

		const { app } = await createApp(context);
		let renderContext = {};
		const appContent = await renderToString(app, renderContext);
		console.log('app content', appContent);
		console.log('context', renderContext);
		const html = template.replace(`<!--ssr-outlet-->`, appContent);

		res.set('Content-Type', 'text/html');
		res.end(html);
	} catch (e) {
		// vite.ssrFixStacktrace(e);
		console.error(e);
		res.status(500).end(e.message);
	}

	// renderer.renderToString(context, (err, html) => {
	// 	if (err) {
	// 		console.log('got error', req.url, err.message);
	// 		res.status(500).end('Internal Server Error');
	// 		return;
	// 	} else if (context.redirect) {
	// 		console.log('sending redirect', context.redirect);
	// 		res.redirect(301, context.redirect);
	// 		return;
	// 	} else if (context.errorCode) {
	// 		console.log('sending error code', context.errorCode);
	// 		res.status(context.errorCode);
	// 	}

	// 	const total = Date.now() - s;
	// 	console.log(
	// 		'total',
	// 		total + 'ms',
	// 		'render',
	// 		total - context.prefetchTime + 'ms',
	// 		req.url,
	// 		req.headers['user-agent']
	// 	);

	// 	++numRequests;
	// 	if (numRequests > numRequestsToRestartAt) {
	// 		setTimeout(() => {
	// 			console.log('Close worker to restart');
	// 			process.exit();
	// 		});
	// 	}
	// });
});

const port = 3501;
server.listen(port, () => {
	console.log(`server started at localhost:${port}`);
});
// }
