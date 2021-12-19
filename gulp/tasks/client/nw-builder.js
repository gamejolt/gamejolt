const fs = require('fs-extra');
const path = require('path');
const plist = require('simple-plist');
const readdirp = require('readdirp');
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
			await this._buildWindows();
		} else if (this.config.platform === 'osx') {
			await this._buildMac();
		}

		await this._packageApp();
	}

	get _buildDir() {
		return path.resolve(this.config.clientBuildDir, 'build');
	}

	get _packagedFile() {
		return path.resolve(
			this.config.clientBuildDir,
			this.config.platformArch + '-package.tar.gz'
		);
	}

	/**
	 * This is the main directory that all the files are in for nwjs.
	 */
	get _macAppDir() {
		return path.resolve(this._buildDir, 'nwjs.app');
	}

	/**
	 * This is the directory that nwjs puts all the chrome data on mac.
	 */
	get _macFrameworkDir() {
		if (!this.__macCurrentDir) {
			const versionsDir = path.resolve(
				this._macAppDir,
				'Contents',
				'Frameworks',
				'nwjs Framework.framework',
				'Versions'
			);

			// The Current file contains the version.
			const chromeVersion = fs
				.readFileSync(path.resolve(versionsDir, 'Current'), {
					encoding: 'utf8',
				})
				.replace(/\s+/g, '');

			this.__macCurrentDir = path.resolve(versionsDir, chromeVersion);
		}

		return this.__macCurrentDir;
	}
	__macCurrentDir = null;

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
			to = path.resolve(this._macFrameworkDir, filename);
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

	async _buildMac() {
		const bundleId = 'com.gamejolt.client';
		const frameworkHelperDir = path.resolve(this._macFrameworkDir, 'Helpers');

		// Update the icons.
		const iconPath = path.resolve(this._macAppDir, 'Contents', 'Resources');
		const icons = ['app.icns', 'document.icns'];

		for (const icon of icons) {
			console.log(`Copying macOS icon (${icon}) to ${iconPath}`);
			await fs.copy(path.resolve(__dirname, 'icons/mac.icns'), path.resolve(iconPath, icon));
		}

		// Rename main app executable.
		const oldExec = path.resolve(this._macAppDir, 'Contents', 'MacOS', 'nwjs');
		const newExec = path.resolve(this._macAppDir, 'Contents', 'MacOS', this._appName);
		console.log(`Renaming inner app executable: ${oldExec} -> ${newExec}`);
		await fs.move(oldExec, newExec);

		// Gotta update all the plists for the inner apps that nwjs uses.
		const infoPlistPaths = [
			{
				path: path.resolve(this._macAppDir, 'Contents', 'Info.plist'),
				keysToUpdate: {
					CFBundleDisplayName: this._appName,
					CFBundleExecutable: this._appName,
					CFBundleIdentifier: bundleId,
					CFBundleName: this._appName,
					CFBundleShortVersionString: this.packageJson.version,
					// This is apparently no longer used, but we want to override NWJS.
					CFBundleSignature: '????',
				},
			},
		];

		const entries = readdirp(frameworkHelperDir, {
			directoryFilter: i => i.basename.startsWith('nwjs Helper'),
			type: 'directories',
			depth: 1,
		});

		for await (const entry of entries) {
			const newFilename = entry.basename.replace(/^nwjs/, 'Game Jolt');
			const newPath = path.resolve(path.dirname(entry.fullPath), newFilename);
			const helperName = newFilename.replace(/\.app/, '');

			const renames = [
				// Executable.
				{
					from: path.resolve(
						entry.fullPath,
						'Contents',
						'MacOS',
						entry.basename.replace(/\.app/, '')
					),
					to: path.resolve(entry.fullPath, 'Contents', 'MacOS', helperName),
				},
				// Folder.
				{ from: entry.fullPath, to: newPath },
			];

			for (const { from, to } of renames) {
				console.log(`Move nwjs helper: ${from} -> ${to}`);
				await fs.move(from, to);
			}

			let helperBundleId = `${bundleId}.helper`;
			const matches = helperName.match(/\((.+?)\)/);
			if (matches) {
				helperBundleId += `.${matches[1].toLowerCase()}`;
			}

			infoPlistPaths.push({
				path: path.resolve(newPath, 'Contents', 'Info.plist'),
				keysToUpdate: {
					CFBundleDisplayName: helperName,
					CFBundleExecutable: helperName,
					CFBundleIdentifier: helperBundleId,
					CFBundleName: helperName,
					CFBundleShortVersionString: this.packageJson.version,
				},
			});
		}

		for (const { path, keysToUpdate } of infoPlistPaths) {
			console.log(`Update Info.plist at ${path}`);

			const plistData = Object.assign({}, plist.readFileSync(path), keysToUpdate);
			plist.writeFileSync(path, plistData);
		}
	}

	async _packageApp() {
		let packageDir = path.resolve(this._buildDir, 'package');
		if (this.config.platform === 'osx') {
			packageDir = path.resolve(
				this._buildDir,
				'nwjs.app',
				'Contents',
				'Resources',
				'app.nw',
				'package'
			);
		}

		let from = '',
			to = '';

		// Copy our app build files into a new folder to start packaging things up.
		from = this.config.buildDir;
		to = packageDir;
		console.log(`Copying app files: ${from} -> ${to}`);
		await fs.copy(from, to);

		console.log(`Writing our package.json`);
		await fs.remove(path.resolve(packageDir, 'package.json'));
		await fs.writeFile(
			path.resolve(packageDir, '..', 'package.json'),
			JSON.stringify(this.packageJson),
			{ encoding: 'utf8' }
		);

		// We pull some stuff out of the package folder up one directory.
		from = path.resolve(packageDir, 'node_modules');
		to = path.resolve(packageDir, '..', 'node_modules');
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
