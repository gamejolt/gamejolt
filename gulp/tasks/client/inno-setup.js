var fs = require('fs-extra');
var path = require('path');
var childProcess = require('child_process');

function cp(cmd, args) {
	return new Promise(function (resolve, reject) {
		childProcess.execFile(cmd, args, function (err, stdout, stderr) {
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

const InnoSetup = function (appDir, outDir, version, gameUID, certFile, certPw) {
	this.appDir = appDir;
	this.outDir = outDir;
	this.version = version;
	this.gameUID = gameUID;
	this.certFile = certFile;
	this.certPw = certPw;
};

InnoSetup.prototype.build = async () => {
	let script = await fs.readFile(path.resolve(__dirname, 'vendor/gamejolt.iss'), {
		encoding: 'utf8',
	});

	script = script
		.replace(/\{\{ICON_DIR\}\}/g, shellEscape(path.resolve(__dirname, 'icons')))
		.replace(/\{\{APP_DIR\}\}/g, shellEscape(this.appDir))
		.replace(/\{\{OUT_DIR\}\}/g, shellEscape(this.outDir))
		.replace(/\{\{GAME_UID\}\}/g, this.gameUID)
		.replace(/\{\{APP_VERSION\}\}/g, this.version);

	const scriptFile = path.resolve(__dirname, 'vendor/tmp-gamejolt.iss');
	await fs.writeFile(scriptFile, script, { encoding: 'utf8' });

	await cp('iscc.exe', [
		'/Ssigntool=' +
			shellEscape(path.resolve(__dirname, 'vendor/signtool.exe')) +
			' sign /f ' +
			shellEscape(this.certFile) +
			' /p ' +
			this.certPw +
			' /t http://timestamp.digicert.com $f',
		'/Q',
		scriptFile,
	]);
};

module.exports = InnoSetup;
