// const fs = require( 'fs' );
// const path = require('path');
// const favicon = require('serve-favicon');
// const compression = require('compression');
// const serialize = require('serialize-javascript');

const fs = require('fs');
const path = require('path');
const express = require('express');
const { createBundleRenderer } = require('vue-server-renderer');

function resolve(file) {
	return path.resolve(__dirname, file);
}

const server = express();
const bundle = require('../build/dev-server/vue-ssr-server-bundle.json');
const renderer = createBundleRenderer(bundle, {
	runInNewContext: true,
	template: fs.readFileSync(resolve('./index-ssr.html'), 'utf-8'),
});

function serve(path) {
	console.log('serving', resolve(path));
	return express.static(resolve(path), {
		maxAge: 0,
		fallthrough: true,
		index: false,
		// maxAge: cache && isProd ? 60 * 60 * 24 * 30 : 0
	});
}

// app.use(compression({ threshold: 0 }))
// app.use(favicon('./public/logo-48.png'))
// app.use('/service-worker.js', serve('./dist/service-worker.js'))
// app.use('/manifest.json', serve('./manifest.json'))
// app.use( '/assets', serve( '../build/dev/assets' ) );
// app.use( /\/[^\/]+/, serve( '../build/dev' ) );
server.use(serve('../build/dev/'));

server.get('*', (req, res) => {
	// res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	// res.header('Expires', '-1');
	// res.header('Pragma', 'no-cache');

	// const s = Date.now();

	// if (!renderer) {
	// 	return res.end('waiting for compilation... refresh in a moment.');
	// }

	// res.setHeader('Content-Type', 'text/html');
	// // res.setHeader("Server", serverInfo);

	// const errorHandler = err => {
	// 	if (err && err.code === 404) {
	// 		res.status(404).end('404 | Page Not Found');
	// 	} else {
	// 		// Render Error Page or Redirect
	// 		res.status(500).end('500 | Internal Server Error');
	// 		console.error(`error during render : ${req.url}`);
	// 		console.error(err);
	// 	}
	// };

	const context = {
		url: req.url,
		ua: req.headers['user-agent'],
	};

	// console.time('request');

	const s = Date.now();
	renderer.renderToString(context, (err, html) => {
		if (err) {
			console.error(err);
			res.status(500).end('Internal Server Error');
			return;
		}
		// console.log(html);
		res.end(html);
		const total = Date.now() - s;
		console.log('total', total + 'ms', 'render', total - context.prefetchTime + 'ms');
		// console.timeEnd('request');
	});

	// renderer
	// 	.renderToStream(ctx)
	// 	.on('error', errorHandler)
	// 	.on('end', () => {
	// 		const total = Date.now() - s;
	// 		console.log(
	// 			`request: ${total}ms | compilation: ${total - ctx.prefetchTime}ms`
	// 		);
	// 	})
	// 	.pipe(res);

	// const renderStream = renderer.renderToStream( context );

	// renderStream.once( 'data', () =>
	// {
	// 	res.write( indexHTML.head );
	// } );

	// renderStream.on('data', ( chunk ) =>
	// {
	// 	res.write( chunk );
	// } );

	// renderStream.on( 'end', () =>
	// {
	// 	// embed initial store state
	// 	if ( context.initialState ) {
	// 		res.write(
	// 			`<script>window.__INITIAL_STATE__=${JSON.stringify(context.initialState)}</script>`
	// 		);
	// 	}
	// 	res.end( indexHTML.tail );
	// 	console.log( `whole request: ${Date.now() - s}ms` );
	// } );

	// renderStream.on( 'error', ( err ) =>
	// {
	// 	if ( err && err.code === '404' ) {
	// 		res.status( 404 ).end( '404 | Page Not Found' );
	// 		return;
	// 	}

	// 	// Render Error Page or Redirect
	// 	res.status( 500 ).end( 'Internal Error 500' );
	// 	console.error( `error during render : ${req.url}` );
	// 	console.error( err );
	// } );
});

const port = 8081;
server.listen(port, () => {
	console.log(`server started at localhost:${port}`);
});
