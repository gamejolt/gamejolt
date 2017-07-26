// const fs = require( 'fs' );
// const path = require('path');
// const favicon = require('serve-favicon');
// const compression = require('compression');
// const serialize = require('serialize-javascript');

const fs = require('fs');
const path = require('path');
const express = require('express');
const { createBundleRenderer } = require('vue-server-renderer');

const isProd = process.env.NODE_ENV === 'production';

const serverBuildPath = isProd ? '../../build/prod-server/' : '../build/dev-server/';
const clientBuildPath = isProd ? '../../build/prod/' : '../build/dev/';

function resolve(file) {
	return path.resolve(__dirname, file);
}

const server = express();
const serverBundle = require(path.join(serverBuildPath, 'vue-ssr-server-bundle.json'));
const clientManifest = require(path.join(clientBuildPath, 'vue-ssr-client-manifest.json'));

const renderer = createBundleRenderer(serverBundle, {
	runInNewContext: true,
	template: fs.readFileSync(resolve('./index-ssr.html'), 'utf-8'),
	clientManifest,
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
		console.log('total', total + 'ms', 'render', total - context.prefetchTime + 'ms');
	});
});

const port = 3501;
server.listen(port, () => {
	console.log(`server started at localhost:${port}`);
});
