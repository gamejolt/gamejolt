import * as cp from 'child_process';
import { readFile, writeFile } from 'fs-extra';
import * as path from 'path';
import { shellEscape } from '../utils';

function execFile(cmd: string, args: string[]) {
	return new Promise<void>(function (resolve, reject) {
		cp.execFile(cmd, args, function (err, _stdout, stderr) {
			if (err || stderr) {
				return reject(err || stderr);
			}
			resolve();
		});
	});
}

export async function buildInnoSetup(options: {
	installerDir: string;
	outDir: string;
	version: string;
	gameUID: string;
	certFile: string;
	certPw: string;
}) {
	const vendorDir = path.resolve(__dirname, 'vendor');
	let script = await readFile(path.join(vendorDir, 'gamejolt.iss'), {
		encoding: 'utf8',
	});

	// Version in innosetup isnt semver compatible. it expects a value in the form of 4 numbers separated by dot.
	const versionStuff = options.version.match(/^v?(\d+)\.(\d+)\.(\d+)/);
	if (!versionStuff) {
		throw new Error('Version is invalid');
	}
	const installerVersion = versionStuff.join('.') + '.0';

	script = script
		.replace(/\{\{ICON_DIR\}\}/g, shellEscape(path.resolve(__dirname, 'icons')))
		.replace(/\{\{APP_DIR\}\}/g, shellEscape(options.installerDir))
		.replace(/\{\{OUT_DIR\}\}/g, shellEscape(options.outDir))
		.replace(/\{\{GAME_UID\}\}/g, options.gameUID)
		.replace(/\{\{APP_VERSION\}\}/g, options.version)
		.replace(/\{\{INSTALLER_VERSION\}\}/g, installerVersion);

	const scriptFilepath = path.join(vendorDir, 'tmp-gamejolt.iss');
	await writeFile(scriptFilepath, script, { encoding: 'utf8' });

	await execFile('iscc.exe', [
		'/Ssigntool=' +
			shellEscape(path.join(vendorDir, 'signtool.exe')) +
			' sign /f ' +
			shellEscape(options.certFile) +
			' /p ' +
			options.certPw +
			' /tr http://timestamp.digicert.com $f',
		'/Q',
		scriptFilepath,
	]);
}
