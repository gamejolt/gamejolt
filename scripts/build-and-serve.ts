/**
 * This script does 3 things:
 * 1. Builds the web frontend.
 * 2. Watches for changes to the code and rebuilds as needed.
 * 3. Runs a tiny http/s server to serve the web frontend from.
 *
 * The build process and http server are made to stop each other whenever one of them dies.
 *
 * By default this script will watch the frontend using https on port 443.
 *
 * Command line options:
 *     --http	Serves the frontend using http.
 *     --port   Specifies the port to use.
 *              By default this is 80 when doing http and 443 when doing https.
 *     --host   Specifies the host address to bind to.
 *              By default this is 127.0.0.1 which only allows local connections.
 */

const express = require('express') as typeof import('express');
const path = require('path') as typeof import('path');
const fs = require('fs') as typeof import('fs');
const http = require('http') as typeof import('http');
const https = require('https') as typeof import('https');
const cp = require('child_process') as typeof import('child_process');
const os = require('os') as typeof import('os');
const treekill = require('tree-kill') as typeof import('tree-kill');

function initializeHttpServer(aborter: AbortController) {
	// Avoid doing anything if already aborted.
	if (aborter.signal.aborted) {
		return;
	}

	const useHttps = !process.argv.includes('--http');
	const defaultPort = useHttps ? 443 : 80;

	const hostArgIdx = process.argv.indexOf('--host');
	const host =
		hostArgIdx > 1 && hostArgIdx < process.argv.length - 1
			? process.argv[hostArgIdx + 1]
			: '127.0.0.1';

	const portArgIdx = process.argv.indexOf('--port');
	const port =
		portArgIdx > 1 && portArgIdx < process.argv.length - 1
			? parseInt(process.argv[portArgIdx + 1])
			: defaultPort;

	const projectRoot = path.resolve(__dirname, '..');
	const buildDir = path.join(projectRoot, 'build');
	const webBuildPath = path.join(buildDir, 'web');

	console.log(`serving from ${webBuildPath} on ${useHttps ? 'https' : 'http'}://${host}:${port}`);

	const app = express();

	app.use(
		express.static(path.join(webBuildPath), {
			index: false,
		})
	);

	app.use('/favicon.ico', (req, res) => {
		res.status(404).end();
	});

	app.get('*', (request, response) => {
		console.log(`${request.method} ${request.url}`);
		response.sendFile(path.join(webBuildPath, 'index.html'));
	});

	const server = useHttps
		? https.createServer(
				{
					pfx: fs.readFileSync(path.join(projectRoot, 'development.gamejolt.com.pfx')),
					passphrase: 'yame yolt',
				},
				app
		  )
		: http.createServer(app);

	server
		.on('close', () => {
			console.log('http server closed');
			if (!aborter.signal.aborted) {
				aborter.abort();
			}
		})
		.listen({ port, host, signal: aborter.signal });

	return server;
}

function runViteBuild(aborter: AbortController) {
	const gamejoltDir = path.resolve(__filename, '..', '..');
	const viteExec = os.type() === 'Windows_NT' ? 'vite.cmd' : 'vite';
	const pathToVite = path.join(gamejoltDir, 'node_modules', '.bin', viteExec);

	let killedVite = false;

	const viteProcess = cp
		.spawn(pathToVite, ['build', '--watch'], {
			cwd: path.resolve(__filename, '..', '..'),
			stdio: ['ignore', 'inherit', 'inherit'],
			env: Object.assign({}, process.env, {
				GJ_PLATFORM: 'web',
				GJ_BUILD_TYPE: 'serve-build',
			}),
		})
		.on('close', () => {
			console.log('vite process closed');
			killedVite = true;
			if (!aborter.signal.aborted) {
				aborter.abort();
			}
		});

	aborter.signal.addEventListener('abort', () => {
		if (killedVite) {
			return;
		}
		killedVite = true;

		if (viteProcess.pid) {
			console.log('killing vite process');
			treekill(viteProcess.pid, 'SIGINT');
		}
	});

	return viteProcess;
}

const aborter = new AbortController();

initializeHttpServer(aborter);
runViteBuild(aborter);
