import {
	createTarGz,
	downloadFile,
	isLinux,
	isMac,
	isWindows,
	packageJson,
	runShell,
	tryWithBackoff,
	unzip,
} from '../utils';
import * as fs from 'fs-extra';

const path = require('path') as typeof import('path');
const os = require('os') as typeof import('os');

export const gjpushVersion = packageJson.gjpushVersion as string;

export type GjpushOptions = {
	/** Where to cache the push tools in */
	cacheDir: string;
};

export class Gjpush {
	constructor(readonly config: GjpushOptions) {}

	async ensureDownloaded() {
		const exists = await fs.pathExists(this.gjpushExecutable);
		if (!exists) {
			await this._downloadGjpush();
		}
	}
	/**
	 * Downloads the gjpush binary used to push the package and installers to GJ
	 * automatically.
	 */
	private async _downloadGjpush() {
		console.log('Downloading push tools');

		// Ensure our cache dir.
		await fs.mkdirp(path.resolve(this.config.cacheDir));

		// In prod we fetch the binary from the github releases page. It is
		// zipped on Github because we didn't want to have OS specific filenames
		// like gjpush-win32.exe so we distinguish the OS by the zip name which
		// then contains gjpush.exe for windows or just gjpush for mac/linux.
		let remoteExecutable = '';
		switch (os.type()) {
			case 'Windows_NT':
				remoteExecutable = 'windows.zip';
				break;
			case 'Darwin':
				remoteExecutable = 'osx.zip';
				break;
			case 'Linux':
				remoteExecutable = 'linux.zip';
				break;
			default:
				throw new Error('Unsupported operating system');
		}

		const gjpushZip = path.resolve(this.config.cacheDir, 'gjpush.zip');

		await downloadFile(
			`https://github.com/gamejolt/cli/releases/download/${gjpushVersion}/${remoteExecutable}`,
			gjpushZip
		);

		await unzip(gjpushZip, this.config.cacheDir);

		// Ensure the gjpush binary is executable.
		await fs.chmod(this.gjpushExecutable, '0755');
	}

	/**
	 * Pushes the single package to GJ.
	 */
	async push(gameId: number, packageId: number, filepath: string) {
		console.log('Pushing archive to Game Jolt');

		// We trust the exit codes to tell us if something went wrong
		// because a non 0 exit code will make this throw.
		const gjPush = () =>
			runShell(this.gjpushExecutable, {
				args: [
					'--no-resume',
					'-g',
					gameId,
					'-p',
					packageId,
					'-r',
					packageJson.version,
					filepath,
				],
			});

		// Let's try to be resilient to network failures by trying a few times.
		await tryWithBackoff(gjPush, 3);
	}

	get gjpushExecutable() {
		let basename = '';
		switch (os.type()) {
			case 'Windows_NT':
				basename = 'gjpush.exe';
				break;
			case 'Darwin':
			case 'Linux':
				basename = 'gjpush';
				break;
			default:
				throw new Error('Unsupported operating system');
		}

		return path.join(this.config.cacheDir, basename);
	}
}
