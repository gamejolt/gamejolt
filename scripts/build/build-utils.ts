const { spawn, exec } = require('child_process') as typeof import('child_process');
const { https } = require('follow-redirects');
const tar = require('tar');
const path = require('path') as typeof import('path');
const os = require('os') as typeof import('os');

import * as fs from 'fs-extra';

export function sleep(ms: number) {
	return new Promise<void>(resolve => {
		setTimeout(resolve, ms);
	});
}

export function createTarGz(src: string, dest: string) {
	return tar.c(
		{
			file: dest,
			gzip: true,
			cwd: path.resolve(src),
			portable: true,
		},
		['./']
	);
}

export async function extractTarGz(src: string, dest: string) {
	await fs.mkdirp(dest);
	await tar.x({ file: src, gzip: true, cwd: path.resolve(dest, '..') });
}

export async function unzip(src, dest) {
	if (os.platform() === 'win32') {
		await runShell(
			`powershell -command "Expand-Archive ${shellEscape(src)} ${shellEscape(dest)}"`
		);
	} else {
		await runShell('unzip', {
			args: ['-o', src, '-d', dest],
		});
	}
}

export function shellEscape(str: string) {
	return `${str}`.replace(/ /g, '\\ ');
}

export type RunShellOptions = Partial<{
	cwd: string;
	args: string[];
}>;

export function runShell(command: string, options: RunShellOptions = {}) {
	const cwd = options.cwd || null;
	const args = options.args || [];

	if (args.length > 0) {
		command += ' ' + args.map(i => shellEscape(i)).join(' ');
	}

	const child = spawn(command, {
		cwd,
		shell: true,
		stdio: 'inherit',
	});

	return new Promise<void>((resolve, reject) => {
		child.on('exit', code => {
			if (code === 0) {
				return resolve();
			}

			reject(`Command failed (${command}) with exit code ${code}`);
		});
	});
}

export type ExecShellOptions = RunShellOptions;

/**
 * Similar to runShell, only using exec instead of spawn.
 * Use this to get string output from command lines.
 * Throws if stuff's logged in stderr.
 */
export function execShell(command: string, options: ExecShellOptions = {}) {
	const cwd = options.cwd || null;
	const args = options.args || [];

	if (args.length > 0) {
		command += ' ' + args.map(i => shellEscape(i)).join(' ');
	}

	return new Promise((resolve, reject) => {
		exec(command, { cwd }, (error, stdout, stderr) => {
			if (error) {
				return reject(error);
			}

			if (stderr) {
				return reject(stderr);
			}

			return resolve(stdout);
		});
	});
}

export function downloadFile(url: string, dest: string) {
	return new Promise<void>((resolve, reject) => {
		const file = fs.createWriteStream(dest);

		https
			.get(url, response => {
				if (response.statusCode !== 200) {
					return reject(
						new Error('Invalid status code. Expected 200 got ' + response.statusCode)
					);
				}

				response.pipe(file);
				file.on('finish', () => {
					file.close();
					resolve();
				});
			})
			.on('error', reject)
			.end();
	});
}

/**
 * Tries to run a particular function in a loop. If there's a failure, we back
 * off and try again.
 */
export async function tryWithBackoff(cb, times) {
	let err = null;
	for (let i = 0; i < times; i++) {
		if (i !== 0) {
			await sleep(5000 + Math.floor(Math.random() * 10000));
		}

		try {
			err = null;
			await cb();
			break;
		} catch (e) {
			err = e;
		}
	}

	if (err) {
		throw err;
	}
}

export function isObject(item) {
	return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge to plain javascript objects, returning a new one.
 */
export function mergeDeep(target, source) {
	if (!isObject(target) || !isObject(source)) {
		return {};
	}

	const ret = { ...target };

	for (const key in source) {
		if (isObject(source[key])) {
			if (!ret[key]) {
				ret[key] = {};
			}
			ret[key] = mergeDeep(ret[key], source[key]);
		} else {
			ret[key] = source[key];
		}
	}

	return ret;
}
