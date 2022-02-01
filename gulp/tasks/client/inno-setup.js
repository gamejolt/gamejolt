const { execFile } = require('child_process');
const { readFile, writeFile } = require('fs-extra');
const { resolve: resolvePath } = require('path');
const { shellEscape } = require('../build-utils');

function cp(cmd, args) {
	return new Promise(function (resolve, reject) {
		execFile(cmd, args, function (err, stdout, stderr) {
			if (err || stderr) {
				return reject(err || stderr);
			}
			resolve();
		});
	});
}

module.exports.buildInnoSetup = async (appDir, outDir, version, gameUID, certFile, certPw) => {
	let script = await readFile(resolvePath(__dirname, 'vendor/gamejolt.iss'), {
		encoding: 'utf8',
	});

	script = script
		.replace(/\{\{ICON_DIR\}\}/g, shellEscape(resolvePath(__dirname, 'icons')))
		.replace(/\{\{APP_DIR\}\}/g, shellEscape(appDir))
		.replace(/\{\{OUT_DIR\}\}/g, shellEscape(outDir))
		.replace(/\{\{GAME_UID\}\}/g, gameUID)
		.replace(/\{\{APP_VERSION\}\}/g, version);

	const scriptFile = resolvePath(__dirname, 'vendor/tmp-gamejolt.iss');
	await writeFile(scriptFile, script, { encoding: 'utf8' });

	await cp('iscc.exe', [
		'/Ssigntool=' +
			shellEscape(resolvePath(__dirname, 'vendor/signtool.exe')) +
			' sign /f ' +
			shellEscape(certFile) +
			' /p ' +
			certPw +
			' /t http://timestamp.digicert.com $f',
		'/Q',
		scriptFile,
	]);
};
