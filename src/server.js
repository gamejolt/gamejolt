const argv = require('minimist')(process.argv);
const fs = require('fs');
const path = require('path');
const express = require('express');
const cluster = require('cluster');
const { createBundleRenderer } = require('vue-server-renderer');

function resolve(file) {
	return path.resolve(__dirname, file);
}

// Leave one free worker so we have a core for old prerender service.
const numWorkers = require('os').cpus().length - 1;
const isProd = process.env.NODE_ENV === 'production';
const section = argv.section || 'app';
const serverBuildPath = isProd ? '../../build/prod-server/' : '../build/dev-server/';
const clientBuildPath = isProd ? '../../build/prod/' : '../build/dev/';

const serverBundle = require(path.join(
	serverBuildPath,
	'vue-ssr-server-bundle-' + section + '.json'
));
const clientManifest = require(path.join(
	clientBuildPath,
	'vue-ssr-client-manifest-' + section + '.json'
));

if (cluster.isMaster) {
	console.log(`Master ${process.pid} is running`);

	// Fork workers.
	for (let i = 0; i < numWorkers; i++) {
		cluster.fork();
	}

	cluster.on('exit', (worker, code, signal) => {
		console.log(`worker ${worker.process.pid} died`);
		cluster.fork();
	});
} else {
	console.log(`Worker ${process.pid} started`);

	const server = express();
	const renderer = createBundleRenderer(serverBundle, {
		runInNewContext: true,
		template: fs.readFileSync(resolve('./index-ssr.html'), 'utf-8'),
		clientManifest,
		inject: false,
	});

	if (!isProd) {
		function serve(path) {
			console.log('serving', resolve(path));
			return express.static(resolve(path), {
				maxAge: 0,
				fallthrough: true,
				index: false,
				// maxAge: cache && isProd ? 60 * 60 * 24 * 30 : 0
			});
		}

		server.use(serve(clientBuildPath));
	}

	server.get('*', (req, res) => {
		const context = {
			url: req.url,
			ua: req.headers['user-agent'],
		};

		const s = Date.now();
		renderer.renderToString(context, (err, html) => {
			if (err) {
				console.error(err);
				res.status(500).end('Internal Server Error');
				return;
			}
			res.end(html);
			const total = Date.now() - s;
			console.log(
				'total',
				total + 'ms',
				'render',
				total - context.prefetchTime + 'ms',
				req.url,
				req.headers['user-agent']
			);
		});
	});

	const port = 3501;
	server.listen(port, () => {
		console.log(`server started at localhost:${port}`);
	});
}
