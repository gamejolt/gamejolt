import { ConfigEnv as ViteConfigEnv } from 'vite';
import { Options } from './vite-options';

const path = require('path') as typeof import('path');
const os = require('os') as typeof import('os');
const cp = require('child_process') as typeof import('child_process');
const treekill = require('tree-kill') as typeof import('tree-kill');

const viteEnvKey = 'GJ_VITE_OPTS';
function writeToViteEnv(gjOpts: Options, env: typeof process['env']) {
	env[viteEnvKey] = Buffer.from(JSON.stringify(gjOpts), 'utf8').toString('base64');
	return env;
}

export function readFromViteEnv(env: typeof process['env']): Options {
	const marshalled = env[viteEnvKey];
	if (marshalled === undefined) {
		throw new Error(`Expected environment variable ${viteEnvKey} to be populated.`);
	}

	return JSON.parse(Buffer.from(marshalled, 'base64').toString('utf8'));
}

export type ViteConfig = {
	command: ViteConfigEnv['command'];
	mode?: ViteConfigEnv['mode'];
	watch?: boolean;
};

export function runVite(
	viteConfig: ViteConfig,
	gjOpts: Options,
	spawnOpts?: { signal?: AbortSignal }
) {
	const { signal } = spawnOpts || {};

	const gamejoltDir = path.resolve(__dirname, '..', '..');
	const viteExec = os.type() === 'Windows_NT' ? 'vite.cmd' : 'vite';
	const pathToVite = path.join(gamejoltDir, 'node_modules', '.bin', viteExec);

	let state: 'running' | 'stopping' | 'stopped' = 'running';

	const viteArgs: string[] = [viteConfig.command];
	if (viteConfig.mode !== undefined) {
		viteArgs.push('--mode', viteConfig.mode);
	}
	if (viteConfig.watch) {
		viteArgs.push('--watch');
	}

	const viteProcess = cp
		.spawn(pathToVite, viteArgs, {
			cwd: gamejoltDir,
			stdio: 'pipe',
			env: writeToViteEnv(gjOpts, Object.assign({}, process.env, { FORCE_COLOR: '1' })),
		})
		.on('close', () => {
			console.log('vite process closed');
			state = 'stopped';
		});

	viteProcess.stdout.pipe(process.stdout);
	viteProcess.stderr.pipe(process.stderr);

	signal?.addEventListener('abort', () => {
		if (state !== 'running') {
			return;
		}
		state = 'stopping';

		console.log('stopping vite');
		viteProcess.stdin.end();

		// Force kill vite if it did not exit shortly after requested.
		//
		// This can happen because when vite is in build mode it does not listen
		// for process signals or stdin closing. Annoyingly enough, vite seems
		// to do the building in a child process, so we need to make sure to
		// kill all child processes as well, not just the parent.
		const pid = viteProcess.pid;
		if (pid !== undefined) {
			setTimeout(() => {
				if (state === 'stopped') {
					return;
				}

				console.log('force killing vite process');
				treekill(pid, 'SIGTERM');
			}, 5000);
		}
	});

	return viteProcess;
}
