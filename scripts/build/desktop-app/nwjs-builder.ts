import * as fs from 'fs-extra';
import {
	downloadFile,
	extractTarGz,
	isLinux,
	isMac,
	isWindows,
	mergeDeep,
	packageJson,
	runShell,
	unzip,
} from '../utils';
import { acquirePrebuiltFFmpeg } from './ffmpeg-prebuilt';
const path = require('path') as typeof import('path');
const plist = require('simple-plist') as typeof import('simple-plist');
const readdirp = require('readdirp') as typeof import('readdirp');

const NWJS_VERSION = packageJson.nwjsVersion as string;

export type NwBuilderOptions = {
	/** The contents of package.json as a json object */
	packageJson: any;

	/** Where to keep cache related to building the client itself */
	cacheDir: string;

	/** True if to avoid using the cached version of nwjs */
	noCache?: boolean;

	/** Where to build the client in */
	clientBuildDir: string;

	/** Where the frontend is being built */
	frontendBuildDir: string;

	/** True if to use the sdk version for nwjs (enables devtools and debugging features) */
	useSdkVersion: boolean;
};

export class NwBuilder {
	constructor(readonly config: NwBuilderOptions) {
		const jsonOverrides = {
			main: 'chrome-extension://game-jolt-client/package/index.html#/',
			domain: 'game-jolt-client',
			window: {
				icon: 'package/client-icon-256x256.png',
			},
			// Needed on mac, and should only be done during actual build.
			product_string: 'Game Jolt Client',
		};

		console.log(`Overriding package.json for client build.`, jsonOverrides);
		const packageJson = mergeDeep(this.config.packageJson, jsonOverrides);

		if (isWindows()) {
			// ASG is not optional on windows.
			packageJson.dependencies['asg-prebuilt'] =
				packageJson.optionalDependencies['asg-prebuilt'];
		}

		// We don't need these bundled in.
		delete packageJson['node-remote'];
		delete packageJson.devDependencies;
		delete packageJson.optionalDependencies;
		delete packageJson.scripts;
		delete packageJson.platformOverrides;

		this.config.packageJson = packageJson;
	}

	async build() {
		// Ensure our cache dir.
		await fs.mkdirp(path.resolve(this.config.cacheDir));

		await this._setupNwjs();

		await acquirePrebuiltFFmpeg({
			nwjsVersion: NWJS_VERSION,
			cacheDir: this.config.cacheDir,
			outDir: isMac() ? this._macFrameworkDir : this.buildDir,
			noCache: this.config.noCache,
		});
		// await this._setupPrebuiltFFmpeg();

		if (isWindows()) {
			await this._buildWindows();
		} else if (isMac()) {
			await this._buildMac();
		}

		await this._packageApp();
	}

	get platformName() {
		if (isWindows()) {
			return 'win';
		}

		if (isLinux()) {
			return 'linux';
		}

		if (isMac()) {
			return 'mac';
		}

		throw new Error('Unsupported OS');
	}

	get buildDir() {
		return path.resolve(this.config.clientBuildDir, 'build');
	}

	/**
	 * This is the main directory that all the files are in for nwjs.
	 */
	get _macAppDir() {
		return path.resolve(this.buildDir, 'nwjs.app');
	}

	/**
	 * This is the directory that nwjs puts all the chrome data on mac.
	 */
	get _macFrameworkDir() {
		return path.resolve(
			this._macAppDir,
			'Contents',
			'Frameworks',
			'nwjs Framework.framework',
			'Versions',
			'Current'
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
		if (isWindows()) {
			return 'GameJoltClient';
		} else if (isMac()) {
			return 'Game Jolt Client';
		}

		return 'game-jolt-client';
	}

	async _setupNwjs() {
		const nwVersion = `v${NWJS_VERSION}`;

		const folder = [
			this.config.useSdkVersion ? 'nwjs-sdk' : 'nwjs',
			nwVersion,
			this.platformName,
			'x64',
		].join('-');

		const cachePath = path.resolve(this.config.cacheDir, folder);

		const filename = folder + (isLinux() ? '.tar.gz' : '.zip');
		const cachePathArchive = path.resolve(this.config.cacheDir, filename);

		// If we don't have it in cache yet, get it.
		const exists = await fs.pathExists(cachePath);
		if (!exists || (this.config.noCache ?? false)) {
			const url = `https://dl.nwjs.io/${nwVersion}/${filename}`;
			console.log(`Downloading NW.js binary: ${url}`);

			await downloadFile(url, cachePathArchive);

			if (cachePathArchive.endsWith('.zip')) {
				await unzip(cachePathArchive, this.config.cacheDir);
			} else {
				await extractTarGz(cachePathArchive, cachePath);
			}
		} else {
			console.log(`Using cached NW.js binary: ${filename}`);
		}

		console.log(`Copying NW.js to the build dir: ${this.buildDir}`);

		await fs.copy(cachePath, this.buildDir);
	}

	async _buildWindows() {
		const rcedit = require('rcedit');
		const outputExe = path.resolve(this.buildDir, 'nw.exe');
		const winIco = path.resolve(__dirname, 'icons/winico.ico');

		console.log(`Modifying nw.exe with rcedit.`);

		await rcedit(outputExe, {
			'file-version': this.config.packageJson.version,
			'product-version': this.config.packageJson.version,
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
					CFBundleShortVersionString: this.config.packageJson.version,
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
			const newFilename = entry.basename.replace(/^nwjs/, 'Game Jolt Client');
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
					CFBundleShortVersionString: this.config.packageJson.version,
				} as any,
			});
		}

		for (const { path, keysToUpdate } of infoPlistPaths) {
			console.log(`Update Info.plist at ${path}`);

			const plistData = Object.assign({}, plist.readFileSync(path), keysToUpdate);
			plist.writeFileSync(path, plistData);
		}
	}

	async _packageApp() {
		let appDir = path.resolve(this.buildDir);
		if (isMac()) {
			appDir = path.resolve(this.buildDir, 'nwjs.app', 'Contents', 'Resources', 'app.nw');
		}
		const packageDir = path.resolve(appDir, 'package');

		let from = '',
			to = '';

		// Copy our app build files into a new folder to start packaging things up.
		from = this.config.frontendBuildDir;
		to = packageDir;
		console.log(`Copying app files: ${from} -> ${to}`);
		await fs.copy(from, to);

		console.log(`Writing our package.json`);
		await fs.writeFile(
			path.resolve(appDir, 'package.json'),
			JSON.stringify(this.config.packageJson),
			{
				encoding: 'utf8',
			}
		);

		// Install node modules.
		console.log('Installing node_modules.');
		const commands: { command: string; args: string[] }[] = [
			{
				command: 'yarn',
				args: ['--cwd', appDir, '--production', '--ignore-scripts'],
			},
			// Run client-voodoo's post install to get the joltron binaries in.
			{
				command: 'yarn',
				args: [
					'--cwd',
					path.resolve(appDir, 'node_modules/client-voodoo'),
					'run',
					'postinstall',
				],
			},
		];

		if (isWindows()) {
			commands.push(
				// Run asg-prebuilt's post install to get the asg binaries in.
				{
					command: 'yarn',
					args: [
						'--cwd',
						path.resolve(appDir, 'node_modules/asg-prebuilt'),
						'run',
						'postinstall',
					],
				}
			);
		}

		for (const { command, args } of commands) {
			await runShell(command, { args });
		}

		// We need to rename the executable file to our app name.
		if (isLinux()) {
			from = path.resolve(this.buildDir, 'nw');
			to = path.resolve(this.buildDir, this._appName);
		} else if (isMac()) {
			from = path.resolve(this.buildDir, 'nwjs.app');
			to = path.resolve(this.buildDir, `${this._appName}.app`);
		} else if (isWindows()) {
			from = path.resolve(this.buildDir, 'nw.exe');
			to = path.resolve(this.buildDir, `${this._appName}.exe`);
		}

		console.log(`Renaming executable to our app name: ${from} -> ${to}`);
		await fs.move(from, to);
	}
}
