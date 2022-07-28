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

import * as fs from 'fs-extra';
import { gjSectionConfigs, type GjSectionName } from './build/section-config';
import { Options, parseAndInferOptionsFromCommandline } from './build/vite-options';
import { runVite } from './build/vite-runner';

const minimist = require('minimist');
const express = require('express') as typeof import('express');
const path = require('path') as typeof import('path');
const http = require('http') as typeof import('http');
const https = require('https') as typeof import('https');
const os = require('os') as typeof import('os');

function initializeHttpServer(
	args: Record<string, any>,
	gjOpts: Options,
	aborter: AbortController
) {
	// Avoid doing anything if already aborted.
	if (aborter.signal.aborted) {
		return;
	}

	const useHttps = !args.http;

	let defaultPort;
	if (os.type() === 'Darwin') {
		// On mac you need sudo to listen on privileged ports (any port < 1024).
		// To avoid this, listen on higher ports and use a different rooted
		// process to only do the port forwarding locally. There is an example
		// command of using socat in README.md
		defaultPort = useHttps ? 8443 : 8080;
	} else {
		defaultPort = useHttps ? 443 : 80;
	}

	const host: string = args.host ?? '127.0.0.1';
	const port: number = args.port ?? defaultPort;

	const projectRoot = path.resolve(__dirname, '..');
	const buildDir = path.join(projectRoot, 'build');
	const webBuildPath = path.join(buildDir, 'web');

	const sectionFilename = gjOpts.section === 'app' ? 'index' : gjOpts.section;

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
		response.sendFile(path.join(webBuildPath, `${sectionFilename}.html`));
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

function runViteBuild(gjOpts: Options, aborter: AbortController) {
	const viteProcess = runVite({ command: 'build', watch: true, mode: 'development' }, gjOpts, {
		signal: aborter.signal,
	});

	viteProcess.on('close', () => {
		if (!aborter.signal.aborted) {
			console.log(`vite process closed (gjOpts: ${JSON.stringify(gjOpts)}`);
			aborter.abort();
		}
	});

	return viteProcess;
}

(async () => {
	const args = minimist(process.argv.splice(2));
	const gjOpts = await parseAndInferOptionsFromCommandline(args);
	gjOpts.buildType = 'serve-build';

	const aborter = new AbortController();

	// Only initialize the http server when serving web.
	if (gjOpts.platform === 'web') {
		initializeHttpServer(args, gjOpts, aborter);
	}

	// If building for desktop app and section wasnt explicitly given, build all sections.
	if (gjOpts.platform === 'desktop' && !('section' in args)) {
		try {
			const rootDir = path.resolve(__dirname, '..');
			const frontendBuildDir = path.join(rootDir, 'build', 'desktop');

			// Clean the build folder to start fresh.
			console.log('Cleaning up old build dir');
			await fs.remove(frontendBuildDir);

			const desktopAppSectionNames = Object.entries(gjSectionConfigs)
				.filter(([k, v]) => v.desktopApp)
				.map(([k, v]) => k as GjSectionName);

			for (const sectionName of desktopAppSectionNames) {
				const argsForSection = Object.assign({}, args, {
					section: sectionName,
					'empty-outdir': false,
				});
				const gjOptsForSection = await parseAndInferOptionsFromCommandline(argsForSection);
				gjOptsForSection.buildType = 'serve-build';

				runViteBuild(gjOptsForSection, aborter);
			}
		} catch (e) {
			console.error(e);
			aborter.abort();
		}
	} else {
		runViteBuild(gjOpts, aborter);
	}
})();
