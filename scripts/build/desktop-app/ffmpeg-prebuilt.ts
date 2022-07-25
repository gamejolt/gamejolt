const path = require('path') as typeof import('path');
const os = require('os') as typeof import('os');
import * as fs from 'fs-extra';
import { downloadFile, unzip } from '../utils';

type AcquireOptions = {
	cacheDir: string;
	outDir: string;
	nwjsVersion: string;
	noCache?: boolean;
};

/**
 * Gets the prebuilt ffmpeg library and installs it into the package.
 */
export async function acquirePrebuiltFFmpeg(opts: AcquireOptions) {
	const platform = os.type();
	let to, filename, platformShortname;
	switch (platform) {
		case 'Windows_NT':
			platformShortname = 'win';
			filename = 'ffmpeg.dll';
			to = path.resolve(opts.outDir, filename);
			break;

		case 'Darwin':
			platformShortname = 'osx';
			filename = 'libffmpeg.dylib';
			to = path.resolve(opts.outDir, filename);
			break;

		case 'Linux':
			platformShortname = 'linux';
			filename = 'libffmpeg.so';
			to = path.resolve(opts.outDir, 'lib', filename);
			break;

		default:
			throw new Error(`Unsupported platform '${platform}'`);
	}

	const arch = os.arch();
	if (arch !== 'x64') {
		throw new Error(`Unsupported arch '${arch}'`);
	}

	await fs.mkdirp(opts.cacheDir);

	const cachePath = path.resolve(
		opts.cacheDir,
		`${opts.nwjsVersion}-${platformShortname}-${arch}`
	);

	// If we don't have it in cache yet, get it.
	const exists = await fs.pathExists(cachePath);
	if (!exists || (opts.noCache ?? false)) {
		let url = `https://github.com/iteufel/nwjs-ffmpeg-prebuilt/releases/download/${opts.nwjsVersion}/${opts.nwjsVersion}`;
		url += `-${platformShortname}`;
		url += `-${arch}.zip`;
		console.log(`Downloading ffmpeg-prebuilt for NW.js: ${url}`);

		const cachePathZip = cachePath + '.zip';

		await downloadFile(url, cachePathZip);
		await unzip(cachePathZip, cachePath);
	}

	console.log(
		`Installing ffmpeg-prebuilt to the build dir: ${path.resolve(cachePath, filename)} -> ${to}`
	);
	await fs.copy(path.resolve(cachePath, filename), to, { overwrite: false });
	return to;
}
