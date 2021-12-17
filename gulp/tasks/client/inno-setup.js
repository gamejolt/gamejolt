const { execFile } = require('child_process');
const { readFile, writeFile } = require('fs-extra');
const { resolve: resolvePath } = require('path');

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

function shellEscape(str) {
	return str.replace(/ /g, '\\ ');
}

class InnoSetup {
	constructor(appDir, outDir, version, gameUID, certFile, certPw) {
		this.appDir = appDir;
		this.outDir = outDir;
		this.version = version;
		this.gameUID = gameUID;
		this.certFile = certFile;
		this.certPw = certPw;
	}

	async build() {
		let script = await readFile(resolvePath(__dirname, 'vendor/gamejolt.iss'), {
			encoding: 'utf8',
		});

		script = script
			.replace(/\{\{ICON_DIR\}\}/g, shellEscape(resolvePath(__dirname, 'icons')))
			.replace(/\{\{APP_DIR\}\}/g, shellEscape(this.appDir))
			.replace(/\{\{OUT_DIR\}\}/g, shellEscape(this.outDir))
			.replace(/\{\{GAME_UID\}\}/g, this.gameUID)
			.replace(/\{\{APP_VERSION\}\}/g, this.version);

		const scriptFile = resolvePath(__dirname, 'vendor/tmp-gamejolt.iss');
		await writeFile(scriptFile, script, { encoding: 'utf8' });

		await cp('iscc.exe', [
			'/Ssigntool=' +
				shellEscape(resolvePath(__dirname, 'vendor/signtool.exe')) +
				' sign /f ' +
				shellEscape(this.certFile) +
				' /p ' +
				this.certPw +
				' /t http://timestamp.digicert.com $f',
			'/Q',
			scriptFile,
		]);
	}
}

module.exports = InnoSetup;
