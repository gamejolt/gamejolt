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

// Workers gracefully self-terminate after handling this many requests so the
// cluster orchestrator can fork a fresh process. Bounds long-lived memory
// growth / leaks in the SSR bundle without needing a full deploy. No jitter
// needed since request times are not even close to consistent that the workers
// will drift naturally.
//
// When running standalone (e.g. `yarn ssr`), there's no cluster orchestrator to
// fork a replacement, so we disable the threshold entirely — otherwise the dev
// server would just exit mid-session with nothing to bring it back up.
const isClustered = typeof process.send === 'function';
const RestartThreshold = isClustered ? 10_000 : Infinity;

let requestCount = 0;
let isAwaitingDrainGrant = false;
let isShuttingDown = false;
/** @type {import('http').Server | undefined} */
let httpServer;

// Ask the cluster master for permission to drain. The master only hands out
// one drain slot at a time across the worker pool, so we keep serving full
// traffic until our turn comes up — this protects throughput when the worker
// count is small. Only callable when clustered (RestartThreshold is Infinity
// otherwise, so the counter middleware never reaches this path).
function requestDrain() {
	if (isShuttingDown || isAwaitingDrainGrant) {
		return;
	}
	isAwaitingDrainGrant = true;
	console.log(`Worker ${process.pid} reached ${requestCount} requests, requesting drain slot`);
	process.send({ cmd: 'request-drain' });
}

process.on(
	'message',
	/** @param {unknown} msg */
	msg => {
		if (
			typeof msg === 'object' &&
			msg !== null &&
			/** @type {{cmd?: string}} */ (msg).cmd === 'drain-granted'
		) {
			beginGracefulShutdown();
		}
	}
);

function beginGracefulShutdown() {
	if (isShuttingDown) {
		return;
	}

	isShuttingDown = true;
	console.log(`Worker ${process.pid} draining and exiting (${requestCount} requests served)`);

	// We're a node cluster worker, so the listening socket isn't actually ours —
	// the cluster master holds it and round-robins accepted connections to
	// workers via IPC. Calling close() here just tells the master to remove us
	// from the dispatch pool; the listening socket stays open and new TCP
	// handshakes continue to be accepted and routed to the other workers.
	// In-flight requests on this worker are allowed to finish, and the callback
	// fires once they're all done.
	httpServer.close(() => {
		console.log(`Worker ${process.pid} drained, exiting`);
		process.exit(0);
	});

	// close() also waits on idle keep-alive sockets, which can sit around for
	// seconds before the client times them out. Kick them now so the drain
	// isn't gated on idle clients — active requests are untouched.
	httpServer.closeIdleConnections();

	// Hard timeout in case an in-flight render hangs.
	setTimeout(() => {
		console.log(`Worker ${process.pid} drain timed out, force-exiting`);
		process.exit(0);
	}, 30_000).unref();
}

const server = express();

server.use((req, res, next) => {
	if (!isShuttingDown) {
		++requestCount;
		if (requestCount >= RestartThreshold) {
			requestDrain();
		}
	}

	// Encourage the load balancer to drop keep-alive once we're shutting down,
	// so subsequent requests are routed to a healthy worker.
	if (isShuttingDown) {
		res.set('Connection', 'close');
	}

	next();
});

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
			console.log('Sending redirect', result.redirect);
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
			console.log('Sending error code', result.errorCode);
			res.status(result.errorCode);
		} else {
			res.status(200);
		}

		res.set({ 'Content-Type': 'text/html' }).end(html, () => {
			const total = Date.now() - start;
			console.log(
				'Response ended',
				'total time:',
				total + 'ms',
				'render time:',
				total - result.prefetchTime + 'ms',
				'request count:',
				`${requestCount}/${RestartThreshold}`,
				req.url,
				req.headers['host'],
				req.headers['user-agent']
			);
		});
	} catch (e) {
		console.log('Got error', req.url, e);
		res.status(500).end('Internal Server Error');
	}
});

const port = 3501;
httpServer = server.listen(port, () => {
	const restartNote = isClustered
		? `will restart after ${RestartThreshold} requests`
		: 'standalone mode — request-based restart disabled';
	console.log(`Server started at localhost:${port} (${restartNote})`);
});
