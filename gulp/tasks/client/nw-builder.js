const fs = require('fs-extra');
const path = require('path');
const { extractTarGz, downloadFile, unzip, createTarGz, mergeDeep } = require('../build-utils');

const NWJS_VERSION = '0.55.0';

class NwBuilder {
	constructor(buildConfig, packageJson) {
		this.config = buildConfig;

		const overrides = packageJson.platformOverrides[this.config.platform];
		if (overrides) {
			console.log(`Overriding package.json for current platform.`, overrides);
			packageJson = mergeDeep(packageJson, overrides);
		} else {
			console.log(`No package overrides.`);
		}

		delete packageJson.platformOverrides;
		this.packageJson = packageJson;
	}

	async build() {
		// Ensure our cache dir.
		await fs.mkdirp(path.resolve(this.config.clientBuildCacheDir));

		await this._setupNwjs();
		await this._setupPrebuiltFFmpeg();

		if (this.config.platform === 'win') {
			this._buildWindows();
		}

		await this._packageApp();
	}

	get _buildDir() {
		return path.resolve(this.config.clientBuildDir, 'build');
	}

	get _packageDir() {
		return path.resolve(this._buildDir, 'package');
	}

	get _packagedFile() {
		return path.resolve(
			this.config.clientBuildDir,
			this.config.platformArch + '-package.tar.gz'
		);
	}

	/**
	 * We want the name to be:
	 *
	 * 'game-jolt-client' on linux - because kebabs rock
	 *
	 * 'GameJoltClient' on win - so it shows up well in process list and stuff
	 *
	 * 'Game Jolt Client' on mac - so it shows up well in Applications folder.
	 */
	get _appName() {
		if (this.config.platform === 'win') {
			return 'GameJoltClient';
		} else if (this.config.platform === 'osx') {
			return 'Game Jolt Client';
		}

		return 'game-jolt-client';
	}

	async _setupNwjs() {
		const nwVersion = `v${NWJS_VERSION}`;
		const flavor = this.config.production && !this.config.useTestPackage ? 'normal' : 'sdk';

		const folder = [
			flavor === 'sdk' ? 'nwjs-sdk' : 'nwjs',
			nwVersion,
			this.config.platform,
			this.config.arch === 32 ? 'ia32' : 'x64',
		].join('-');

		const cachePath = path.resolve(this.config.clientBuildCacheDir, folder);

		const filename = folder + (this.config.platform === 'linux' ? '.tar.gz' : '.zip');
		const cachePathArchive = path.resolve(this.config.clientBuildCacheDir, filename);

		// If we don't have it in cache yet, get it.
		if (!(await fs.pathExists(cachePath))) {
			let url = `https://dl.nwjs.io/${nwVersion}/${filename}`;
			console.log(`Downloading NW.js binary: ${url}`);

			await downloadFile(url, cachePathArchive);

			if (cachePathArchive.endsWith('.zip')) {
				await unzip(cachePathArchive, this.config.clientBuildCacheDir);
			} else {
				await extractTarGz(cachePathArchive, cachePath);
			}
		} else {
			console.log(`Using cached NW.js binary: ${filename}`);
		}

		console.log(`Copying NW.js to the build dir: ${this._buildDir}`);

		await fs.copy(cachePath, this._buildDir);
	}

	/**
	 * Gets the prebuilt ffmpeg library and installs it into the package.
	 */
	async _setupPrebuiltFFmpeg() {
		const cachePath = path.resolve(
			this.config.clientBuildCacheDir,
			`ffmpeg-prebuilt-${NWJS_VERSION}-${this.config.platformArch}`
		);

		// If we don't have it in cache yet, get it.
		if (!(await fs.pathExists(cachePath))) {
			let url = `https://github.com/iteufel/nwjs-ffmpeg-prebuilt/releases/download/${NWJS_VERSION}/${NWJS_VERSION}`;
			url += `-${this.config.platform}`;
			url += `-${this.config.arch === 32 ? 'ia32' : 'x64'}.zip`;
			console.log(`Downloading ffmpeg-prebuilt for NW.js: ${url}`);

			const cachePathZip = cachePath + '.zip';

			await downloadFile(url, cachePathZip);
			await unzip(cachePathZip, cachePath);
		}

		let to, filename;
		if (this.config.platform === 'win') {
			filename = 'ffmpeg.dll';
			to = path.resolve(this._buildDir, filename);
		} else if (this.config.platform === 'osx') {
			filename = 'libffmpeg.dylib';
			to = path.resolve(
				this._buildDir,
				'nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/Current',
				filename
			);
		} else if (this.config.platform === 'linux') {
			filename = 'libffmpeg.so';
			to = path.resolve(this._buildDir, 'lib', filename);
		}

		console.log(
			`Installing ffmpeg-prebuilt to the build dir: ${path.resolve(
				cachePath,
				filename
			)} -> ${to}`
		);
		await fs.copy(path.resolve(cachePath, filename), to);
	}

	async _buildWindows() {
		const rcedit = require('rcedit');
		const outputExe = path.resolve(this._buildDir, 'nw.exe');
		const winIco = path.resolve(__dirname, 'icons/winico.ico');

		console.log(`Modifying nw.exe with rcedit.`);

		await rcedit(outputExe, {
			'file-version': this.packageJson.version,
			'product-version': this.packageJson.version,
			icon: winIco,
			'version-string': {
				FileDescription: 'Game Jolt',
				LegalCopyright: `Copyright ${new Date().getFullYear()} Game Jolt Inc.`,
				ProductName: 'Game Jolt',
				OriginalFilename: '',
			},
		});
	}

	async _packageApp() {
		const appFiles = this.config.buildDir;
		let from = '',
			to = '';

		// Copy our app build files into a new folder to start packaging things up.
		from = appFiles;
		to = this._packageDir;
		console.log(`Copying app files: ${from} -> ${to}`);
		await fs.copy(from, to);

		console.log(`Writing our package.json`);
		await fs.remove(path.resolve(this._packageDir, 'package.json'));
		await fs.writeFile(
			path.resolve(this._buildDir, 'package.json'),
			JSON.stringify(this.packageJson),
			{ encoding: 'utf8' }
		);

		// We pull some stuff out of the package folder into the main folder.
		from = path.resolve(this._packageDir, 'node_modules');
		to = path.resolve(this._buildDir, 'node_modules');
		console.log(`Moving node_modules out of package dir: ${from} -> ${to}`);
		await fs.move(from, to);

		// We need to rename the executable file to our app name.
		if (this.config.platform === 'linux') {
			from = path.resolve(this._buildDir, 'nw');
			to = path.resolve(this._buildDir, this._appName);
		} else if (this.config.platform === 'osx') {
			from = path.resolve(this._buildDir, 'nwjs.app');
			to = path.resolve(this._buildDir, `${this._appName}.app`);
		} else if (this.config.platform === 'win') {
			from = path.resolve(this._buildDir, 'nw.exe');
			to = path.resolve(this._buildDir, `${this._appName}.exe`);
		}

		console.log(`Renaming executable to our app name: ${from} -> ${to}`);
		await fs.move(from, to);

		console.log(`Zipping up our package: ${this._packagedFile}`);
		await createTarGz(this._buildDir, this._packagedFile);
	}
}

module.exports = { NwBuilder };
