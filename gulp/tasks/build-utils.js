const { spawn } = require('child_process');
const { https } = require('follow-redirects');
const fs = require('fs-extra');
const tar = require('tar');
const path = require('path');
const os = require('os');

module.exports.sleep = ms => {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
};

module.exports.createTarGz = async (src, dest) => {
	await tar.c(
		{
			file: dest,
			gzip: true,
			cwd: path.resolve(src),
			portable: true,
		},
		['./']
	);
};

module.exports.extractTarGz = async (src, dest) => {
	await fs.mkdirp(dest);
	await tar.x({ file: src, gzip: true, cwd: path.resolve(dest, '..') });
};

module.exports.unzip = async (src, dest) => {
	if (os.platform() === 'win32') {
		await this.runShell(
			`powershell -command "Expand-Archive ${this.shellEscape(src)} ${this.shellEscape(
				dest
			)}"`
		);
	} else {
		await this.runShell('unzip', {
			args: ['-o', src, '-d', dest],
		});
	}
};

module.exports.shellEscape = str => {
	return `${str}`.replace(/ /g, '\\ ');
};

module.exports.runShell = (command, options = {}) => {
	const cwd = options.cwd || null;
	const args = options.args || [];

	if (args.length > 0) {
		command += ' ' + args.map(i => this.shellEscape(i)).join(' ');
	}

	const child = spawn(command, {
		cwd,
		shell: true,
		stdio: 'inherit',
	});

	return new Promise((resolve, reject) => {
		child.on('exit', code => {
			if (code === 0) {
				return resolve();
			}

			reject(`Command failed (${command}) with exit code ${code}`);
		});
	});
};

module.exports.downloadFile = (url, dest) => {
	return new Promise((resolve, reject) => {
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
};

/**
 * Tries to run a particular function in a loop. If there's a failure, we back
 * off and try again.
 */
module.exports.tryWithBackoff = async (cb, times) => {
	let err = null;
	for (let i = 0; i < times; i++) {
		if (i !== 0) {
			await this.sleep(5000 + Math.floor(Math.random() * 10000));
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
};

function isObject(item) {
	return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Deep merge to plain javascript objects, returning a new one.
 */
function mergeDeep(target, source) {
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
module.exports.mergeDeep = mergeDeep;
