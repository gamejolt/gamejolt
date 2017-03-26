// const fs = require( 'fs' );
// const path = require('path');
// const express = require('express');
// const favicon = require('serve-favicon');
// const compression = require('compression');
// const serialize = require('serialize-javascript');

const fs = require( 'fs' );
const path = require( 'path' );
const express = require( 'express' );

// const resolve = ( file: string ) => path.resolve(__dirname, file);

const isProd = true;
// const isProd = process.env.NODE_ENV === 'production'
// const serverInfo =
// `express/${require('express/package.json').version} ` +
// `vue-server-renderer/${require( 'vue-server-renderer/package.json' ).version}`;


function resolve( file )
{
	return path.resolve( __dirname, file );
}

function createRenderer( bundle, template )
{
	// https://github.com/vuejs/vue/blob/dev/packages/vue-server-renderer/README.md#why-use-bundlerenderer
	return require( 'vue-server-renderer' ).createBundleRenderer( bundle, {
		template,
		// cache: require( 'lru-cache' )( {
		// 	max: 1000,
		// 	maxAge: 1000 * 60 * 15
		// } ),
	} );
}

const app = express();

let renderer;
if ( isProd ) {
	const bundle = require( '../build/dev-server/vue-ssr-bundle.json' );
	const template = fs.readFileSync( resolve( '../build/dev/index.html' ), 'utf-8' );
	renderer = createRenderer( bundle, template );
}
else {
	// // in development: setup the dev server with watch and hot-reload,
	// // and update renderer / index HTML on file change.
	// require('./build/setup-dev-server')( app, {
	// 	bundleUpdated: ( bundle ) =>
	// 	{
	// 		renderer = createRenderer(bundle);
	// 	},
	// 	indexUpdated: ( index ) =>
	// 	{
	// 		indexHTML = parseIndex(index);
	// 	}
	// });
}

function serve( path )
{
	console.log( 'serving', resolve( path ) );
	return express.static( resolve( path ), {
		maxAge: 0,
		fallthrough: true,
		index: false,
		// maxAge: cache && isProd ? 60 * 60 * 24 * 30 : 0
	} );
}

// app.use(compression({ threshold: 0 }))
// app.use(favicon('./public/logo-48.png'))
// app.use('/service-worker.js', serve('./dist/service-worker.js'))
// app.use('/manifest.json', serve('./manifest.json'))
// app.use( '/assets', serve( '../build/dev/assets' ) );
// app.use( /\/[^\/]+/, serve( '../build/dev' ) );
app.use( serve( '../build/dev/' ) );

app.get( '*', ( req, res ) =>
{
	res.header( 'Cache-Control', 'private, no-cache, no-store, must-revalidate' );
	res.header( 'Expires', '-1' );
	res.header( 'Pragma', 'no-cache' );

	const s = Date.now();

	if ( !renderer ) {
		return res.end( 'waiting for compilation... refresh in a moment.' );
	}

	res.setHeader( 'Content-Type', 'text/html' );
	// res.setHeader("Server", serverInfo);

	const errorHandler = ( err ) =>
	{
		if ( err && err.code === 404 ) {
			res.status(404).end('404 | Page Not Found')
		}
		else {
			// Render Error Page or Redirect
			res.status(500).end('500 | Internal Server Error')
			console.error(`error during render : ${req.url}`)
			console.error(err)
		}
	}

	const ctx = {
		url: req.url,
		ua: req.headers['user-agent'],
	};

	console.log( ctx );

	renderer.renderToStream( ctx )
		.on( 'error', errorHandler )
		.on( 'end', () =>
		{
			const total = Date.now() - s;
			console.log( `request: ${total}ms | compilation: ${total - ctx.prefetchTime}ms` );
		} )
		.pipe( res );

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
} );

const port = 8081;
app.listen( port, () =>
{
	console.log(`server started at localhost:${port}` );
} );
